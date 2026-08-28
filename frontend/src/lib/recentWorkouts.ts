// Backed by the BodyZeal API (GET /api/workouts) instead of localStorage.
// Same exported names/shapes as before (RecentWorkout, RecentWorkoutSet,
// quickPickNames, workoutsThisWeek are unchanged pure functions) — only
// loadRecentWorkouts became async, and saveRecentWorkout is gone: finishing
// a session (POST /api/sessions/:id/finish) already returns the finished
// record, so there's nothing left to save separately.
import { api } from '@/lib/apiClient';

export type RecentWorkoutSet = {
  exerciseName: string;
  reps: number;
  weight: number;
  volume: number;
};

export type RecentWorkout = {
  id?: string;
  name: string;
  finishedAt: string;
  totalVolume: number;
  totalSets?: number;
  sets?: RecentWorkoutSet[];
  durationSeconds?: number;
};

export async function loadRecentWorkouts(): Promise<RecentWorkout[]> {
  try {
    return await api.get<RecentWorkout[]>('/api/workouts?limit=60');
  } catch {
    return [];
  }
}

// Deprecated, localStorage-backed fallback — kept only until the active-
// session rewrite (integration Stage 6) replaces LogWorkoutPage's finish
// flow with POST /api/sessions/:id/finish, whose response already *is* the
// finished-workout record. Writes go nowhere useful once that lands; this
// exists purely so the interim (session logging still localStorage-based)
// doesn't silently lose finished-workout data before Stage 6 ships.
const LEGACY_STORAGE_KEY = 'bodyzeal-recent-workouts';
export function saveRecentWorkout(entry: RecentWorkout) {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const current: RecentWorkout[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify([entry, ...current].slice(0, 60)));
  } catch {
    // best-effort only
  }
}

export function quickPickNames(recent: RecentWorkout[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const workout of recent) {
    if (!seen.has(workout.name)) {
      seen.add(workout.name);
      names.push(workout.name);
    }
    if (names.length >= 4) break;
  }
  const defaults = ['Push Day', 'Pull Day', 'Leg Day', 'Full Body'];
  for (const name of defaults) {
    if (names.length >= 4) break;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function workoutsThisWeek(recent: RecentWorkout[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return recent.filter((workout) => new Date(workout.finishedAt).getTime() >= weekAgo).length;
}
