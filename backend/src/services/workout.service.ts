import { SessionStatus, type WorkoutSession as SessionRow, type WorkoutSet as SetRow, type Exercise as ExerciseRow } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { toFrontendSet, type FrontendWorkoutSet, type FinishedSessionResponse } from './session.service';
import type { QuickLogInput } from '../schemas/workout.schema';

type SessionWithSets = SessionRow & { sets: (SetRow & { exercise: ExerciseRow })[] };
type QuickLogSetWithExercise = SetRow & { exercise: ExerciseRow };

// Matches frontend/src/lib/recentWorkouts.ts's RecentWorkout exactly, plus
// `id`/`kind` — `kind` distinguishes a real finished routine session from a
// one-off quick-logged set once the two are merged into one history list, so
// the frontend can label it and the unified delete endpoint knows which
// table it's looking at without a second round-trip.
export type HistoryEntryResponse = FinishedSessionResponse & { kind: 'session' | 'quickLog' };

function toFinishedWorkoutResponse(row: SessionWithSets): HistoryEntryResponse {
  return {
    id: row.id,
    name: row.name,
    finishedAt: row.finishedAt!.toISOString(),
    totalVolume: row.totalVolume,
    totalSets: row.totalSets,
    durationSeconds: row.durationSeconds ?? 0,
    sets: row.sets.map((s) => ({ exerciseName: s.exercise.name, reps: s.reps, weight: s.weight, volume: s.volume })),
    kind: 'session',
  };
}

// A quick-logged set has no workout "name" of its own — the exercise name
// stands in for it, and it's always exactly one set entry.
function toQuickLogHistoryResponse(row: QuickLogSetWithExercise): HistoryEntryResponse {
  return {
    id: row.id,
    name: row.exercise.name,
    finishedAt: row.loggedAt.toISOString(),
    totalVolume: row.volume,
    totalSets: row.sets,
    durationSeconds: 0,
    sets: [{ exerciseName: row.exercise.name, reps: row.reps, weight: row.weight, volume: row.volume }],
    kind: 'quickLog',
  };
}

/**
 * The user's finished-activity history: real finished routine sessions AND
 * one-off quick-logged sets, merged into one chronological list. A quick log
 * is just as much "an exercise the user did" as a full session, so it
 * belongs in history/streak/stats the same way — see getCurrentStreak.
 */
export async function listFinishedWorkouts(userId: string, limit: number): Promise<HistoryEntryResponse[]> {
  const [sessions, quickLogSets] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId, status: SessionStatus.FINISHED },
      orderBy: { finishedAt: 'desc' },
      take: limit,
      include: { sets: { include: { exercise: true }, orderBy: { loggedAt: 'asc' } } },
    }),
    prisma.workoutSet.findMany({
      where: { userId, sessionId: null },
      orderBy: { loggedAt: 'desc' },
      take: limit,
      include: { exercise: true },
    }),
  ]);

  const entries = [...sessions.map(toFinishedWorkoutResponse), ...quickLogSets.map(toQuickLogHistoryResponse)];
  entries.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  return entries.slice(0, limit);
}

export async function getFinishedWorkoutById(userId: string, id: string): Promise<FinishedSessionResponse> {
  const row = await prisma.workoutSession.findUnique({
    where: { id },
    include: { sets: { include: { exercise: true }, orderBy: { loggedAt: 'asc' } } },
  });
  // A workout that doesn't exist, belongs to someone else, or is still
  // active (not "history" yet) all read as the same 404 — none of those
  // are a finished workout of yours.
  if (!row || row.userId !== userId || row.status !== SessionStatus.FINISHED) {
    throw AppError.notFound('Workout not found');
  }
  return toFinishedWorkoutResponse(row);
}

/**
 * Permanently deletes one history entry — a finished routine session (+ its
 * sets, via the schema's ON DELETE CASCADE) or a one-off quick-logged set —
 * so a wrongly-logged entry can be removed entirely from Exercise History
 * (the only place deletion is exposed; Today's Activity on the dashboard is
 * read-only). Unlike discardSession (session.service.ts), which only flips
 * an ACTIVE session to DISCARDED for in-progress cancellation, this is a
 * real delete of a past record. `id` alone doesn't say which table it's in
 * (the merged history list mixes both), so this tries a session first, then
 * falls back to a quick-log set — the two id spaces never collide (separate
 * UUID-keyed tables). Every analytics/history/streak query already excludes
 * non-FINISHED sessions and (for streak) already counts quick logs, so once
 * the row is gone it disappears from every sum, chart, and streak too.
 */
export async function deleteWorkoutEntry(userId: string, id: string): Promise<void> {
  const session = await prisma.workoutSession.findUnique({ where: { id } });
  if (session) {
    if (session.userId !== userId || session.status !== SessionStatus.FINISHED) {
      throw AppError.notFound('Workout not found');
    }
    await prisma.workoutSession.delete({ where: { id } });
    return;
  }

  const quickLogSet = await prisma.workoutSet.findUnique({ where: { id } });
  if (!quickLogSet || quickLogSet.userId !== userId || quickLogSet.sessionId !== null) {
    throw AppError.notFound('Workout not found');
  }
  await prisma.workoutSet.delete({ where: { id } });
}

// Mirrors todayLog.ts's own `todayKey()` — a UTC calendar-day boundary — so
// "today" means the same day here as it does in the (soon to be replaced)
// localStorage version.
function todayUtcBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Quick-log entries only — sessionId IS NULL is exactly what distinguishes
 * a quick-log row from a session-scoped one. */
export async function getTodayQuickLog(userId: string): Promise<FrontendWorkoutSet[]> {
  const { start, end } = todayUtcBounds();
  const rows = await prisma.workoutSet.findMany({
    where: { userId, sessionId: null, loggedAt: { gte: start, lt: end } },
    include: { exercise: true },
    orderBy: { loggedAt: 'asc' },
  });
  return rows.map(toFrontendSet);
}

export async function createQuickLog(userId: string, input: QuickLogInput): Promise<FrontendWorkoutSet> {
  const exercise = await prisma.exercise.findUnique({ where: { id: input.exerciseId } });
  if (!exercise) {
    throw new AppError(400, 'VALIDATION_ERROR', 'exerciseId does not reference an existing exercise', [
      { field: 'body.exerciseId', issue: `unknown exerciseId "${input.exerciseId}"` },
    ]);
  }

  const volume = input.sets * input.reps * input.weight; // never trust a client-supplied volume
  const row = await prisma.workoutSet.create({
    data: {
      userId,
      sessionId: null,
      exerciseId: input.exerciseId,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight,
      volume,
    },
    include: { exercise: true },
  });
  return toFrontendSet(row);
}

export async function deleteQuickLog(userId: string, id: string): Promise<void> {
  const row = await prisma.workoutSet.findUnique({ where: { id } });
  // Same 404-for-everything-wrong pattern as the session endpoints: missing,
  // someone else's, or a session-scoped set (not a quick-log row at all —
  // that's a different endpoint's job) are all indistinguishable from here.
  if (!row || row.userId !== userId || row.sessionId !== null) {
    throw AppError.notFound('Quick-log entry not found');
  }
  await prisma.workoutSet.delete({ where: { id } });
}
