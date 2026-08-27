import { SessionStatus, type WorkoutSession as SessionRow, type WorkoutSet as SetRow, type Exercise as ExerciseRow } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { toFrontendExercise, type FrontendExercise } from '../mappers/exercise.mapper';
import type { CreateSessionInput, LogSetInput } from '../schemas/session.schema';

export type FrontendWorkoutSet = {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
  loggedAt: string;
};

// Matches frontend/src/lib/activeSession.ts's ActiveSessionSnapshot field-for-
// field (routineId, workoutName, startedAt as epoch ms, exercises, plannedSets,
// activeExerciseId, entries) plus `id`, which the snapshot never needed
// because localStorage only ever held one session; the API needs it to
// address PATCH/finish/sets calls.
export type ActiveSessionResponse = {
  id: string;
  routineId: string | null;
  workoutName: string;
  startedAt: number;
  activeExerciseId: string | null;
  exercises: FrontendExercise[];
  plannedSets: Record<string, number>;
  entries: FrontendWorkoutSet[];
};

// Matches frontend/src/lib/recentWorkouts.ts's RecentWorkout shape exactly,
// plus `id` (an additive field — RecentWorkout never had a stable id because
// it only ever lived in a localStorage array).
export type FinishedSessionResponse = {
  id: string;
  name: string;
  finishedAt: string;
  totalVolume: number;
  totalSets: number;
  sets: { exerciseName: string; reps: number; weight: number; volume: number }[];
  durationSeconds: number;
};

function toFrontendSet(row: SetRow & { exercise: ExerciseRow }): FrontendWorkoutSet {
  return {
    id: row.id,
    exerciseName: row.exercise.name,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    volume: row.volume,
    loggedAt: row.loggedAt.toISOString(),
  };
}

/**
 * Builds the roster/plannedSets/entries the way LogWorkoutPage.tsx builds
 * them client-side: the routine's exercises seed the list (in routine
 * order) with their planned-set targets; anything logged ad-hoc, or
 * currently selected as `activeExerciseId`, that isn't already in that list
 * gets appended — matching how `handleSelectExercise` grows the `exercises`
 * array in the UI. No schema field stores this roster; it's recomputed from
 * the routine + the session's own logged sets every time.
 */
async function buildActiveSessionResponse(session: SessionRow): Promise<ActiveSessionResponse> {
  const [sets, routine] = await Promise.all([
    prisma.workoutSet.findMany({
      where: { sessionId: session.id },
      include: { exercise: true },
      orderBy: { loggedAt: 'asc' },
    }),
    session.routineId
      ? prisma.routine.findUnique({
          where: { id: session.routineId },
          include: { exercises: { orderBy: { orderIndex: 'asc' }, include: { exercise: true } } },
        })
      : null,
  ]);

  const roster: ExerciseRow[] = [];
  const rosterIds = new Set<string>();
  const plannedSets: Record<string, number> = {};

  for (const re of routine?.exercises ?? []) {
    roster.push(re.exercise);
    rosterIds.add(re.exercise.id);
    plannedSets[re.exercise.id] = re.plannedSets;
  }
  for (const set of sets) {
    if (!rosterIds.has(set.exercise.id)) {
      roster.push(set.exercise);
      rosterIds.add(set.exercise.id);
    }
  }
  if (session.activeExerciseId && !rosterIds.has(session.activeExerciseId)) {
    const activeExercise = await prisma.exercise.findUnique({ where: { id: session.activeExerciseId } });
    if (activeExercise) {
      roster.push(activeExercise);
      rosterIds.add(activeExercise.id);
    }
  }

  return {
    id: session.id,
    routineId: session.routineId,
    workoutName: session.name,
    startedAt: session.startedAt.getTime(),
    activeExerciseId: session.activeExerciseId,
    exercises: roster.map(toFrontendExercise),
    plannedSets,
    entries: sets.map(toFrontendSet),
  };
}

export async function getActiveSession(userId: string): Promise<ActiveSessionResponse | null> {
  const session = await prisma.workoutSession.findFirst({
    where: { userId, status: SessionStatus.ACTIVE },
    orderBy: { startedAt: 'desc' },
  });
  if (!session) return null;
  return buildActiveSessionResponse(session);
}

async function assertRoutineVisible(userId: string, routineId: string) {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine || (routine.userId !== null && routine.userId !== userId)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'routineId does not reference a routine you can see', [
      { field: 'body.routineId', issue: `no visible routine with id "${routineId}"` },
    ]);
  }
}

export async function startSession(userId: string, input: CreateSessionInput): Promise<ActiveSessionResponse> {
  const existingActive = await prisma.workoutSession.findFirst({
    where: { userId, status: SessionStatus.ACTIVE },
  });
  if (existingActive) {
    throw new AppError(409, 'CONFLICT', 'An active session already exists — finish or resume it first', [
      { field: 'session', issue: `active session id "${existingActive.id}"` },
    ]);
  }

  if (input.routineId) await assertRoutineVisible(userId, input.routineId);

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      routineId: input.routineId ?? null,
      name: input.name,
      status: SessionStatus.ACTIVE,
      startedAt: new Date(),
    },
  });
  return buildActiveSessionResponse(session);
}

/**
 * Shared by every write on an existing session: 404s identically for "does
 * not exist" and "belongs to someone else" (never leaks another user's
 * session), and a distinct 409 for "exists, is yours, but isn't ACTIVE
 * anymore" — a finished session is immutable, not invisible.
 */
async function assertOwnedActiveSession(userId: string, sessionId: string): Promise<SessionRow> {
  const session = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw AppError.notFound('Workout session not found');
  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError(409, 'CONFLICT', 'This session is no longer active and cannot be modified');
  }
  return session;
}

export async function patchSession(
  userId: string,
  sessionId: string,
  activeExerciseId: string | null,
): Promise<ActiveSessionResponse> {
  await assertOwnedActiveSession(userId, sessionId);

  if (activeExerciseId) {
    const exercise = await prisma.exercise.findUnique({ where: { id: activeExerciseId } });
    if (!exercise) {
      throw new AppError(400, 'VALIDATION_ERROR', 'activeExerciseId does not reference an existing exercise', [
        { field: 'body.activeExerciseId', issue: `unknown exerciseId "${activeExerciseId}"` },
      ]);
    }
  }

  const updated = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { activeExerciseId },
  });
  return buildActiveSessionResponse(updated);
}

export async function logSet(userId: string, sessionId: string, input: LogSetInput): Promise<FrontendWorkoutSet> {
  await assertOwnedActiveSession(userId, sessionId);

  const exercise = await prisma.exercise.findUnique({ where: { id: input.exerciseId } });
  if (!exercise) {
    throw new AppError(400, 'VALIDATION_ERROR', 'exerciseId does not reference an existing exercise', [
      { field: 'body.exerciseId', issue: `unknown exerciseId "${input.exerciseId}"` },
    ]);
  }

  // Volume is always server-computed — a client-supplied volume is never
  // trusted, whatever value it sent was rejected already by `.strict()`.
  const volume = input.sets * input.reps * input.weight;

  // Logging a set for an exercise makes it the active one — mirrors
  // handleAddSets always operating on `activeExercise` in the UI — and both
  // writes must land together, hence the transaction.
  const [row] = await prisma.$transaction([
    prisma.workoutSet.create({
      data: {
        userId,
        sessionId,
        exerciseId: input.exerciseId,
        sets: input.sets,
        reps: input.reps,
        weight: input.weight,
        volume,
      },
      include: { exercise: true },
    }),
    prisma.workoutSession.update({ where: { id: sessionId }, data: { activeExerciseId: input.exerciseId } }),
  ]);
  return toFrontendSet(row);
}

export async function deleteSet(userId: string, sessionId: string, setId: string): Promise<void> {
  await assertOwnedActiveSession(userId, sessionId);

  const set = await prisma.workoutSet.findUnique({ where: { id: setId } });
  if (!set || set.sessionId !== sessionId) throw AppError.notFound('Workout set not found');

  await prisma.workoutSet.delete({ where: { id: setId } });
}

export async function finishSession(userId: string, sessionId: string): Promise<FinishedSessionResponse> {
  const session = await assertOwnedActiveSession(userId, sessionId);
  const finishedAt = new Date();

  // Read-aggregate-then-write: wrapped in a transaction so a set logged
  // concurrently with the finish call can't be counted in the aggregate
  // while missing from the write, or vice versa.
  const { updated, sets } = await prisma.$transaction(async (tx) => {
    const sets = await tx.workoutSet.findMany({
      where: { sessionId },
      include: { exercise: true },
      orderBy: { loggedAt: 'asc' },
    });
    const totalVolume = sets.reduce((sum, s) => sum + s.volume, 0);
    const totalSets = sets.length;
    const durationSeconds = Math.max(0, Math.floor((finishedAt.getTime() - session.startedAt.getTime()) / 1000));

    const updated = await tx.workoutSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.FINISHED, finishedAt, totalVolume, totalSets, durationSeconds },
    });
    return { updated, sets };
  });

  return {
    id: updated.id,
    name: updated.name,
    finishedAt: updated.finishedAt!.toISOString(),
    totalVolume: updated.totalVolume,
    totalSets: updated.totalSets,
    durationSeconds: updated.durationSeconds!,
    sets: sets.map((s) => ({ exerciseName: s.exercise.name, reps: s.reps, weight: s.weight, volume: s.volume })),
  };
}
