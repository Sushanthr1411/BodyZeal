import { Equipment, MuscleGroup, type Exercise as ExerciseRow } from '@prisma/client';

// Prisma enum -> the exact string literals frontend/src/types/workout.ts already
// uses. The response body needs zero transformation on the frontend side.
export type FrontendEquipment =
  | 'Dumbbell'
  | 'Kettlebell'
  | 'Barbell / Rod'
  | 'Resistance Band'
  | 'Cable Machine'
  | 'Machine'
  | 'Bodyweight';

export type FrontendMuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Legs'
  | 'Glutes'
  | 'Abs / Core'
  | 'Calves';

export type FrontendExercise = {
  id: string;
  name: string;
  equipment: FrontendEquipment;
  muscleGroup: FrontendMuscleGroup;
};

const EQUIPMENT_OUT: Record<Equipment, FrontendEquipment> = {
  [Equipment.DUMBBELL]: 'Dumbbell',
  [Equipment.KETTLEBELL]: 'Kettlebell',
  [Equipment.BARBELL_ROD]: 'Barbell / Rod',
  [Equipment.RESISTANCE_BAND]: 'Resistance Band',
  [Equipment.CABLE_MACHINE]: 'Cable Machine',
  [Equipment.MACHINE]: 'Machine',
  [Equipment.BODYWEIGHT]: 'Bodyweight',
};

const MUSCLE_GROUP_OUT: Record<MuscleGroup, FrontendMuscleGroup> = {
  [MuscleGroup.CHEST]: 'Chest',
  [MuscleGroup.BACK]: 'Back',
  [MuscleGroup.SHOULDERS]: 'Shoulders',
  [MuscleGroup.BICEPS]: 'Biceps',
  [MuscleGroup.TRICEPS]: 'Triceps',
  [MuscleGroup.FOREARMS]: 'Forearms',
  [MuscleGroup.LEGS]: 'Legs',
  [MuscleGroup.GLUTES]: 'Glutes',
  [MuscleGroup.ABS_CORE]: 'Abs / Core',
  [MuscleGroup.CALVES]: 'Calves',
};

export function toFrontendExercise(row: ExerciseRow): FrontendExercise {
  return {
    id: row.id,
    name: row.name,
    equipment: EQUIPMENT_OUT[row.equipment],
    muscleGroup: MUSCLE_GROUP_OUT[row.muscleGroup],
  };
}
