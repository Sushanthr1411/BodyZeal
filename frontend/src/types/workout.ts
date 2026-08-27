export type Equipment =
  | 'Dumbbell'
  | 'Kettlebell'
  | 'Barbell / Rod'
  | 'Resistance Band'
  | 'Cable Machine'
  | 'Machine'
  | 'Bodyweight';

export type MuscleGroup =
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

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  muscleGroup: MuscleGroup;
}

export interface WorkoutSet {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
  loggedAt: string;
}

export interface DailySummary {
  date: string;
  exercisesCompleted: number;
  totalVolume: number;
}

/** A single exercise slot within a planned Routine, referencing the shared Exercise dataset by id. */
export interface RoutineExercise {
  exerciseId: string;
  plannedSets: number;
}

/**
 * A Routine is the PLAN (ordered exercises + target sets). A Workout Session is the user's
 * actual execution of that plan, represented with the existing WorkoutSet/Exercise types —
 * Routine never replaces or duplicates those.
 */
export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}
