import type { Exercise, WorkoutSet } from '@/types/workout';

/**
 * Planned-set targets keyed by exercise id. An exercise with no entry here was added
 * ad-hoc mid-session (via "+ Add Exercise") and is open-ended — it never auto-completes.
 */
export type PlannedSetsMap = Record<string, number>;

export function loggedSetCount(exercise: Exercise, entries: WorkoutSet[]): number {
  return entries.filter((entry) => entry.exerciseName === exercise.name).length;
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
