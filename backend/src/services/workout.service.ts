import { SessionStatus, type WorkoutSession as SessionRow, type WorkoutSet as SetRow, type Exercise as ExerciseRow } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { toFrontendSet, type FrontendWorkoutSet, type FinishedSessionResponse } from './session.service';
import type { QuickLogInput } from '../schemas/workout.schema';

type SessionWithSets = SessionRow & { sets: (SetRow & { exercise: ExerciseRow })[] };

// Matches frontend/src/lib/recentWorkouts.ts's RecentWorkout exactly, plus
// `id` — the same shape session.service.ts's finishSession() already
// returns, reused here rather than re-derived.
function toFinishedWorkoutResponse(row: SessionWithSets): FinishedSessionResponse {
  return {
    id: row.id,
    name: row.name,
    finishedAt: row.finishedAt!.toISOString(),
    totalVolume: row.totalVolume,
    totalSets: row.totalSets,
    durationSeconds: row.durationSeconds ?? 0,
    sets: row.sets.map((s) => ({ exerciseName: s.exercise.name, reps: s.reps, weight: s.weight, volume: s.volume })),
  };
}

export async function listFinishedWorkouts(userId: string, limit: number): Promise<FinishedSessionResponse[]> {
  const rows = await prisma.workoutSession.findMany({
    where: { userId, status: SessionStatus.FINISHED },
    orderBy: { finishedAt: 'desc' },
    take: limit,
    include: { sets: { include: { exercise: true }, orderBy: { loggedAt: 'asc' } } },
  });
  return rows.map(toFinishedWorkoutResponse);
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
