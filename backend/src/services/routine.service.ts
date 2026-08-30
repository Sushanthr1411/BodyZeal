import { SessionStatus, type Routine as RoutineRow, type RoutineExercise as RoutineExerciseRow } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import type { RoutineBodyInput } from '../schemas/routine.schema';

export type RoutineExerciseResponse = { exerciseId: string; plannedSets: number };
export type RoutineResponse = {
  id: string;
  name: string;
  isSystemDefault: boolean;
  exercises: RoutineExerciseResponse[];
};

type RoutineWithExercises = RoutineRow & { exercises: RoutineExerciseRow[] };

// frontend/src/types/workout.ts's Routine is { id, name, exercises }. Every
// field below is a superset addition (`isSystemDefault`), never a rename or
// removal, so this stays a drop-in match for that type once the frontend
// wires up to it.
function toRoutineResponse(row: RoutineWithExercises): RoutineResponse {
  return {
    id: row.id,
    name: row.name,
    isSystemDefault: row.isSystemDefault,
    exercises: [...row.exercises]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({ exerciseId: e.exerciseId, plannedSets: e.plannedSets })),
  };
}

/** System defaults (userId null) + the caller's own custom routines. */
export async function listRoutines(userId: string): Promise<RoutineResponse[]> {
  const rows = await prisma.routine.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    include: { exercises: { orderBy: { orderIndex: 'asc' } } },
    orderBy: [{ isSystemDefault: 'desc' }, { createdAt: 'asc' }],
  });
  return rows.map(toRoutineResponse);
}

async function assertExercisesExist(exerciseIds: string[]) {
  const found = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((e) => e.id));
  const missing = exerciseIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'One or more exercises do not exist', [
      { field: 'body.exercises', issue: `unknown exerciseId(s): ${missing.join(', ')}` },
    ]);
  }
}

/**
 * A single Prisma nested-write call — Prisma runs the parent create and the
 * nested child creates as one atomic operation already, so no explicit
 * `$transaction` is needed here (there is no "delete old rows first" step
 * that could partially fail, unlike update/replace below).
 */
export async function createRoutine(userId: string, input: RoutineBodyInput): Promise<RoutineResponse> {
  await assertExercisesExist(input.exercises.map((e) => e.exerciseId));

  const row = await prisma.routine.create({
    data: {
      userId,
      name: input.name,
      isSystemDefault: false,
      exercises: {
        create: input.exercises.map((e, index) => ({
          exerciseId: e.exerciseId,
          plannedSets: e.plannedSets,
          orderIndex: index,
        })),
      },
    },
    include: { exercises: { orderBy: { orderIndex: 'asc' } } },
  });
  return toRoutineResponse(row);
}

/**
 * Throws 404 for a routine that doesn't exist AND for one owned by a
 * different user — both look identical from the outside, so a private
 * routine's existence is never leaked. A system default is a distinct,
 * visible-but-immutable case, so it gets its own 403.
 */
async function assertOwnedCustomRoutine(userId: string, routineId: string): Promise<RoutineRow> {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine) throw AppError.notFound('Routine not found');
  if (routine.isSystemDefault) {
    throw new AppError(403, 'FORBIDDEN', 'System routines are read-only and cannot be modified');
  }
  if (routine.userId !== userId) throw AppError.notFound('Routine not found');
  return routine;
}

export async function updateRoutine(
  userId: string,
  routineId: string,
  input: RoutineBodyInput,
): Promise<RoutineResponse> {
  await assertOwnedCustomRoutine(userId, routineId);
  await assertExercisesExist(input.exercises.map((e) => e.exerciseId));

  // Replacing the exercise list is delete-then-recreate across two tables —
  // genuinely needs a transaction so a mid-way failure can't leave the
  // routine with a half-updated exercise set.
  await prisma.$transaction([
    prisma.routine.update({ where: { id: routineId }, data: { name: input.name } }),
    prisma.routineExercise.deleteMany({ where: { routineId } }),
    prisma.routineExercise.createMany({
      data: input.exercises.map((e, index) => ({
        routineId,
        exerciseId: e.exerciseId,
        plannedSets: e.plannedSets,
        orderIndex: index,
      })),
    }),
  ]);

  const row = await prisma.routine.findUniqueOrThrow({
    where: { id: routineId },
    include: { exercises: { orderBy: { orderIndex: 'asc' } } },
  });
  return toRoutineResponse(row);
}

export async function deleteRoutine(userId: string, routineId: string): Promise<void> {
  await assertOwnedCustomRoutine(userId, routineId);

  // The routineId FK on WorkoutSession is ON DELETE SET NULL, so this delete
  // would otherwise succeed silently and orphan the routine name off of a
  // user's own workout history. Blocking it with a clear 409 is better than
  // either a surprise 500 or quietly losing that link — checked explicitly
  // rather than relying on a schema change. Only FINISHED sessions count as
  // "history" here — an ACTIVE or DISCARDED session (e.g. one cancelled via
  // Cancel Workout) never appears in history/analytics either, so it
  // shouldn't be able to permanently block deleting the routine.
  const sessionCount = await prisma.workoutSession.count({ where: { routineId, status: SessionStatus.FINISHED } });
  if (sessionCount > 0) {
    throw new AppError(409, 'CONFLICT', 'This routine has workout history and cannot be deleted', [
      { field: 'id', issue: `routine is referenced by ${sessionCount} workout session(s)` },
    ]);
  }

  await prisma.routine.delete({ where: { id: routineId } }); // cascades to routine_exercises
}
