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
