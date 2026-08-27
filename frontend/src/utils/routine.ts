import type { Exercise, WorkoutSet } from '@/types/workout';

/**
 * Planned-set targets keyed by exercise id. An exercise with no entry here was added
 * ad-hoc mid-session (via "+ Add Exercise") and is open-ended — it never auto-completes.
 */
export type PlannedSetsMap = Record<string, number>;

// Sums each matching entry's `.sets` count rather than counting entries —
// under the backend's aggregate logging model (Phase 3C: one log-set call =
// one row, however many sets it represents), an entry no longer means "one
// set performed". Counting rows would silently under-report progress toward
// `plannedSets` now that "3 sets" can arrive as a single row instead of 3.
export function loggedSetCount(exercise: Exercise, entries: WorkoutSet[]): number {
  return entries
    .filter((entry) => entry.exerciseName === exercise.name)
    .reduce((total, entry) => total + entry.sets, 0);
}

export function isExerciseComplete(exercise: Exercise, entries: WorkoutSet[], plannedSets: PlannedSetsMap): boolean {
  const planned = plannedSets[exercise.id];
  if (planned === undefined) return false;
  return loggedSetCount(exercise, entries) >= planned;
}

export function findNextIncompleteExercise(
  exercises: Exercise[],
  currentExerciseId: string | null,
  entries: WorkoutSet[],
  plannedSets: PlannedSetsMap,
): Exercise | null {
  const currentIndex = currentExerciseId ? exercises.findIndex((exercise) => exercise.id === currentExerciseId) : -1;
  for (let i = currentIndex + 1; i < exercises.length; i++) {
    if (!isExerciseComplete(exercises[i], entries, plannedSets)) return exercises[i];
  }
  for (let i = 0; i <= currentIndex; i++) {
    if (!isExerciseComplete(exercises[i], entries, plannedSets)) return exercises[i];
  }
  return null;
}

export function routineProgress(exercises: Exercise[], entries: WorkoutSet[], plannedSets: PlannedSetsMap) {
  const completed = exercises.filter((exercise) => isExerciseComplete(exercise, entries, plannedSets)).length;
  return { completed, total: exercises.length };
}
