import type { Equipment, Exercise, MuscleGroup } from '@/types/workout';
import { api } from '@/lib/apiClient';

export const EQUIPMENT_OPTIONS: Equipment[] = [
  'Dumbbell',
  'Kettlebell',
  'Barbell / Rod',
  'Resistance Band',
  'Cable Machine',
  'Machine',
  'Bodyweight',
];

export const MUSCLE_GROUP_OPTIONS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Legs',
  'Glutes',
  'Abs / Core',
  'Calves',
];

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', equipment: 'Barbell / Rod', muscleGroup: 'Chest' },
  { id: 'incline-barbell-bench-press', name: 'Incline Barbell Bench Press', equipment: 'Barbell / Rod', muscleGroup: 'Chest' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', equipment: 'Dumbbell', muscleGroup: 'Chest' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', equipment: 'Dumbbell', muscleGroup: 'Chest' },
  { id: 'cable-chest-fly', name: 'Cable Chest Fly', equipment: 'Cable Machine', muscleGroup: 'Chest' },
  { id: 'machine-chest-press', name: 'Machine Chest Press', equipment: 'Machine', muscleGroup: 'Chest' },
  { id: 'push-up', name: 'Push-Up', equipment: 'Bodyweight', muscleGroup: 'Chest' },
  { id: 'band-chest-press', name: 'Resistance Band Chest Press', equipment: 'Resistance Band', muscleGroup: 'Chest' },

  // Back
  { id: 'pull-up', name: 'Pull-Up', equipment: 'Bodyweight', muscleGroup: 'Back' },
  { id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', equipment: 'Barbell / Rod', muscleGroup: 'Back' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', equipment: 'Dumbbell', muscleGroup: 'Back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'Cable Machine', muscleGroup: 'Back' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', equipment: 'Cable Machine', muscleGroup: 'Back' },
  { id: 'kettlebell-row', name: 'Kettlebell Row', equipment: 'Kettlebell', muscleGroup: 'Back' },
  { id: 'band-row', name: 'Resistance Band Row', equipment: 'Resistance Band', muscleGroup: 'Back' },
  { id: 'machine-row', name: 'Machine Row', equipment: 'Machine', muscleGroup: 'Back' },

  // Shoulders
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', equipment: 'Dumbbell', muscleGroup: 'Shoulders' },
  { id: 'barbell-overhead-press', name: 'Barbell Overhead Press', equipment: 'Barbell / Rod', muscleGroup: 'Shoulders' },
  { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', equipment: 'Dumbbell', muscleGroup: 'Shoulders' },
  { id: 'kettlebell-overhead-press', name: 'Kettlebell Overhead Press', equipment: 'Kettlebell', muscleGroup: 'Shoulders' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', equipment: 'Cable Machine', muscleGroup: 'Shoulders' },
  { id: 'band-shoulder-press', name: 'Resistance Band Shoulder Press', equipment: 'Resistance Band', muscleGroup: 'Shoulders' },
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', equipment: 'Machine', muscleGroup: 'Shoulders' },
  { id: 'pike-push-up', name: 'Pike Push-Up', equipment: 'Bodyweight', muscleGroup: 'Shoulders' },

  // Biceps
  { id: 'dumbbell-bicep-curl', name: 'Dumbbell Bicep Curl', equipment: 'Dumbbell', muscleGroup: 'Biceps' },
  { id: 'hammer-curl', name: 'Hammer Curl', equipment: 'Dumbbell', muscleGroup: 'Biceps' },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', equipment: 'Dumbbell', muscleGroup: 'Biceps' },
  { id: 'concentration-curl', name: 'Concentration Curl', equipment: 'Dumbbell', muscleGroup: 'Biceps' },
  { id: 'alternating-dumbbell-curl', name: 'Alternating Dumbbell Curl', equipment: 'Dumbbell', muscleGroup: 'Biceps' },
  { id: 'barbell-curl', name: 'Barbell Curl', equipment: 'Barbell / Rod', muscleGroup: 'Biceps' },
  { id: 'cable-bicep-curl', name: 'Cable Bicep Curl', equipment: 'Cable Machine', muscleGroup: 'Biceps' },
  { id: 'band-bicep-curl', name: 'Resistance Band Curl', equipment: 'Resistance Band', muscleGroup: 'Biceps' },

  // Triceps
  { id: 'tricep-dip', name: 'Tricep Dip', equipment: 'Bodyweight', muscleGroup: 'Triceps' },
  { id: 'dumbbell-tricep-kickback', name: 'Dumbbell Tricep Kickback', equipment: 'Dumbbell', muscleGroup: 'Triceps' },
  { id: 'overhead-dumbbell-tricep-extension', name: 'Overhead Dumbbell Tricep Extension', equipment: 'Dumbbell', muscleGroup: 'Triceps' },
  { id: 'cable-tricep-pushdown', name: 'Cable Tricep Pushdown', equipment: 'Cable Machine', muscleGroup: 'Triceps' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Barbell Bench Press', equipment: 'Barbell / Rod', muscleGroup: 'Triceps' },
  { id: 'band-tricep-extension', name: 'Resistance Band Tricep Extension', equipment: 'Resistance Band', muscleGroup: 'Triceps' },
  { id: 'machine-tricep-extension', name: 'Machine Tricep Extension', equipment: 'Machine', muscleGroup: 'Triceps' },

  // Forearms
  { id: 'dumbbell-wrist-curl', name: 'Dumbbell Wrist Curl', equipment: 'Dumbbell', muscleGroup: 'Forearms' },
  { id: 'barbell-wrist-curl', name: 'Barbell Wrist Curl', equipment: 'Barbell / Rod', muscleGroup: 'Forearms' },
  { id: 'kettlebell-farmers-carry', name: "Kettlebell Farmer's Carry", equipment: 'Kettlebell', muscleGroup: 'Forearms' },
  { id: 'band-wrist-curl', name: 'Resistance Band Wrist Curl', equipment: 'Resistance Band', muscleGroup: 'Forearms' },
  { id: 'reverse-barbell-curl', name: 'Reverse Barbell Curl', equipment: 'Barbell / Rod', muscleGroup: 'Forearms' },

  // Legs
  { id: 'barbell-back-squat', name: 'Barbell Back Squat', equipment: 'Barbell / Rod', muscleGroup: 'Legs' },
  { id: 'kettlebell-goblet-squat', name: 'Kettlebell Goblet Squat', equipment: 'Kettlebell', muscleGroup: 'Legs' },
  { id: 'kettlebell-lunges', name: 'Kettlebell Lunges', equipment: 'Kettlebell', muscleGroup: 'Legs' },
  { id: 'kettlebell-romanian-deadlift', name: 'Kettlebell Romanian Deadlift', equipment: 'Kettlebell', muscleGroup: 'Legs' },
  { id: 'kettlebell-step-up', name: 'Kettlebell Step-Up', equipment: 'Kettlebell', muscleGroup: 'Legs' },
  { id: 'dumbbell-lunges', name: 'Dumbbell Lunges', equipment: 'Dumbbell', muscleGroup: 'Legs' },
  { id: 'leg-press', name: 'Leg Press', equipment: 'Machine', muscleGroup: 'Legs' },
  { id: 'bodyweight-squat', name: 'Bodyweight Squat', equipment: 'Bodyweight', muscleGroup: 'Legs' },
  { id: 'band-squat', name: 'Resistance Band Squat', equipment: 'Resistance Band', muscleGroup: 'Legs' },

  // Glutes
  { id: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', equipment: 'Barbell / Rod', muscleGroup: 'Glutes' },
  { id: 'kettlebell-swing', name: 'Kettlebell Swing', equipment: 'Kettlebell', muscleGroup: 'Glutes' },
  { id: 'glute-bridge', name: 'Glute Bridge', equipment: 'Bodyweight', muscleGroup: 'Glutes' },
  { id: 'cable-glute-kickback', name: 'Cable Glute Kickback', equipment: 'Cable Machine', muscleGroup: 'Glutes' },
  { id: 'band-glute-bridge', name: 'Resistance Band Glute Bridge', equipment: 'Resistance Band', muscleGroup: 'Glutes' },
  { id: 'machine-hip-thrust', name: 'Machine Hip Thrust', equipment: 'Machine', muscleGroup: 'Glutes' },

  // Abs / Core
  { id: 'plank', name: 'Plank', equipment: 'Bodyweight', muscleGroup: 'Abs / Core' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', equipment: 'Bodyweight', muscleGroup: 'Abs / Core' },
  { id: 'cable-woodchopper', name: 'Cable Woodchopper', equipment: 'Cable Machine', muscleGroup: 'Abs / Core' },
  { id: 'kettlebell-russian-twist', name: 'Kettlebell Russian Twist', equipment: 'Kettlebell', muscleGroup: 'Abs / Core' },
  { id: 'dumbbell-side-bend', name: 'Dumbbell Side Bend', equipment: 'Dumbbell', muscleGroup: 'Abs / Core' },
  { id: 'band-pallof-press', name: 'Resistance Band Pallof Press', equipment: 'Resistance Band', muscleGroup: 'Abs / Core' },
  { id: 'machine-ab-crunch', name: 'Machine Ab Crunch', equipment: 'Machine', muscleGroup: 'Abs / Core' },

  // Calves
  { id: 'standing-barbell-calf-raise', name: 'Standing Barbell Calf Raise', equipment: 'Barbell / Rod', muscleGroup: 'Calves' },
  { id: 'dumbbell-calf-raise', name: 'Dumbbell Calf Raise', equipment: 'Dumbbell', muscleGroup: 'Calves' },
  { id: 'bodyweight-calf-raise', name: 'Bodyweight Calf Raise', equipment: 'Bodyweight', muscleGroup: 'Calves' },
  { id: 'machine-calf-raise', name: 'Machine Calf Raise', equipment: 'Machine', muscleGroup: 'Calves' },
  { id: 'band-calf-raise', name: 'Resistance Band Calf Raise', equipment: 'Resistance Band', muscleGroup: 'Calves' },
];

// Fetch-once cache: EXERCISES starts seeded with the array above (so every
// existing `EXERCISES.find(...)` / `filterExercises(EXERCISES, ...)` call
// site keeps working immediately, offline or online) and is opportunistically
// refreshed from the backend's exercise catalog (GET /api/exercises, no auth
// required) once, on module load. The array's contents are replaced in place
// — the exported reference never changes — so components that re-render for
// any other reason (route change, auth settling, etc.) pick up the synced
// data without needing their own loading state.
let syncedFromApi = false;
export async function syncExercisesFromApi(): Promise<void> {
  if (syncedFromApi) return;
  try {
    const fromApi = await api.get<Exercise[]>('/api/exercises');
    if (fromApi.length > 0) {
      EXERCISES.length = 0;
      EXERCISES.push(...fromApi);
      syncedFromApi = true;
    }
  } catch {
    // Offline or backend unreachable — keep the bundled fallback list above.
  }
}

void syncExercisesFromApi();
