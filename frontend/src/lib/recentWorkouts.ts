// Lightweight, frontend-only workout history (no backend). Powers the Log Workout
// start screen (quick-pick names + a this-week stat) and the Dashboard analytics
// section. Deliberately NOT a context — just browser storage read/written by
// whichever page needs it.

const STORAGE_KEY = 'bodyzeal-recent-workouts';
const MAX_ENTRIES = 60;

export type RecentWorkoutSet = {
  exerciseName: string;
  reps: number;
  weight: number;
  volume: number;
};

export type RecentWorkout = {
  name: string;
  finishedAt: string;
  totalVolume: number;
  totalSets?: number;
  sets?: RecentWorkoutSet[];
  durationSeconds?: number;
};

export function loadRecentWorkouts(): RecentWorkout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentWorkout(entry: RecentWorkout) {
  try {
    const current = loadRecentWorkouts();
    const next = [entry, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort only — never block the finish flow on storage errors
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
