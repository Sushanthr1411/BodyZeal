import type { Routine } from '@/types/workout';

// Planned routines built from the shared EXERCISES dataset (data/exercises.ts) — no separate
// exercise data. Each entry's exerciseId must exist in EXERCISES.
export const ROUTINES: Routine[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    exercises: [
      { exerciseId: 'barbell-bench-press', plannedSets: 3 },
      { exerciseId: 'incline-barbell-bench-press', plannedSets: 3 },
      { exerciseId: 'dumbbell-shoulder-press', plannedSets: 3 },
      { exerciseId: 'dumbbell-lateral-raise', plannedSets: 3 },
      { exerciseId: 'cable-tricep-pushdown', plannedSets: 3 },
    ],
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    exercises: [
      { exerciseId: 'pull-up', plannedSets: 3 },
      { exerciseId: 'barbell-bent-over-row', plannedSets: 3 },
      { exerciseId: 'lat-pulldown', plannedSets: 3 },
      { exerciseId: 'seated-cable-row', plannedSets: 3 },
      { exerciseId: 'dumbbell-bicep-curl', plannedSets: 3 },
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    exercises: [
      { exerciseId: 'barbell-back-squat', plannedSets: 4 },
      { exerciseId: 'leg-press', plannedSets: 3 },
      { exerciseId: 'dumbbell-lunges', plannedSets: 3 },
      { exerciseId: 'kettlebell-romanian-deadlift', plannedSets: 3 },
      { exerciseId: 'bodyweight-calf-raise', plannedSets: 3 },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    exercises: [
      { exerciseId: 'barbell-back-squat', plannedSets: 3 },
      { exerciseId: 'barbell-bench-press', plannedSets: 3 },
      { exerciseId: 'barbell-bent-over-row', plannedSets: 3 },
      { exerciseId: 'dumbbell-shoulder-press', plannedSets: 3 },
      { exerciseId: 'plank', plannedSets: 3 },
    ],
  },
];
