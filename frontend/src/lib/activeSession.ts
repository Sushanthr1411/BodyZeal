// Frontend-only persistence for the IN-PROGRESS workout session (localStorage), mirroring
// recentWorkouts.ts. This is what lets the Dashboard show "Continue Workout" and lets a
// workout survive navigating away from /workout. No backend — a teammate can swap this
// for a real persistence layer later without changing the call sites.
import type { Exercise, WorkoutSet } from '@/types/workout';
import type { PlannedSetsMap } from '@/utils/routine';

const STORAGE_KEY = 'bodyzeal-active-session';

export type ActiveSessionSnapshot = {
  routineId: string | null;
  workoutName: string;
  startedAt: number;
  exercises: Exercise[];
  plannedSets: PlannedSetsMap;
  activeExerciseId: string | null;
  startedExerciseIds: string[];
  entries: WorkoutSet[];
};

export function loadActiveSession(): ActiveSessionSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ActiveSessionSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(snapshot: ActiveSessionSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // best-effort only — never block the workout on storage errors
  }
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort
  }
}
