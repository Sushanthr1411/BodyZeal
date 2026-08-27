import { Equipment, MuscleGroup } from '@prisma/client';
import { prisma } from '../config/prisma';
import { toFrontendExercise, type FrontendExercise } from '../mappers/exercise.mapper';

export type ExerciseFilters = {
  muscle?: MuscleGroup;
  equipment?: Equipment;
};

export async function listExercises(filters: ExerciseFilters): Promise<FrontendExercise[]> {
  const rows = await prisma.exercise.findMany({
    where: {
      ...(filters.muscle ? { muscleGroup: filters.muscle } : {}),
      ...(filters.equipment ? { equipment: filters.equipment } : {}),
    },
    orderBy: { name: 'asc' },
  });
  return rows.map(toFrontendExercise); // [] when nothing matches — a normal, valid result
}

export async function getExerciseById(id: string): Promise<FrontendExercise | null> {
  const row = await prisma.exercise.findUnique({ where: { id } });
  return row ? toFrontendExercise(row) : null;
}
