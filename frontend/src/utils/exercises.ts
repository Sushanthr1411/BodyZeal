import type { Equipment, Exercise, MuscleGroup } from '@/types/workout';

export const ALL_EQUIPMENT = 'All Equipment' as const;
export const ALL_MUSCLE_GROUPS = 'All Muscles' as const;

export type EquipmentFilter = Equipment | typeof ALL_EQUIPMENT;
export type MuscleGroupFilter = MuscleGroup | typeof ALL_MUSCLE_GROUPS;

export function filterExercises(
  exercises: Exercise[],
  equipment: EquipmentFilter,
  muscleGroup: MuscleGroupFilter,
): Exercise[] {
  return exercises.filter((exercise) => {
    const matchesEquipment = equipment === ALL_EQUIPMENT || exercise.equipment === equipment;
    const matchesMuscleGroup = muscleGroup === ALL_MUSCLE_GROUPS || exercise.muscleGroup === muscleGroup;
    return matchesEquipment && matchesMuscleGroup;
  });
}
