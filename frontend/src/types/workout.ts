export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
}

export type ExerciseCategory = 'Strength' | 'Cardio' | 'Bodyweight';

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
