import type { RecentWorkout } from '@/lib/recentWorkouts';
import { EXERCISES } from '@/data/exercises';
import type { MuscleGroup } from '@/types/workout';

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function muscleGroupFor(exerciseName: string): MuscleGroup | null {
  return EXERCISES.find((e) => e.name === exerciseName)?.muscleGroup ?? null;
}

export type DayVolume = { dateKey: string; label: string; volume: number };

/** Total volume per calendar day for the trailing `days` window, oldest first. */
export function volumeByDay(history: RecentWorkout[], days = 7): DayVolume[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  const order: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    order.push(key);
    buckets.set(key, 0);
  }
  const cutoff = today.getTime() - days * DAY_MS;
  for (const workout of history) {
    const t = new Date(workout.finishedAt).getTime();
    if (t < cutoff) continue;
    const key = dateKey(workout.finishedAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + workout.totalVolume);
  }
  return order.map((key) => ({
    dateKey: key,
    label: new Date(key).toLocaleDateString('en-US', { weekday: 'short' }),
    volume: buckets.get(key) ?? 0,
  }));
}

export type MuscleGroupSlice = { muscleGroup: string; volume: number; percent: number };

/** Volume grouped by muscle group across all history, top 6 + "Other". */
export function muscleGroupBreakdown(history: RecentWorkout[]): MuscleGroupSlice[] {
  const totals = new Map<string, number>();
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      const group = muscleGroupFor(set.exerciseName);
      if (!group) continue;
      totals.set(group, (totals.get(group) ?? 0) + set.volume);
    }
  }
  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6);
  const restTotal = rest.reduce((sum, [, v]) => sum + v, 0);
  if (restTotal > 0) top.push(['Other', restTotal]);
  const grandTotal = top.reduce((sum, [, v]) => sum + v, 0) || 1;
  return top.map(([muscleGroup, volume]) => ({
    muscleGroup,
    volume,
    percent: Math.round((volume / grandTotal) * 100),
  }));
}

export type FrequencyDay = { dateKey: string; count: number; dayOfWeek: number };

/** One entry per calendar day for the trailing `weeks` window — workout count per day, for a heatmap grid. */
export function frequencyGrid(history: RecentWorkout[], weeks = 8): FrequencyDay[] {
  const counts = new Map<string, number>();
  for (const workout of history) {
    const key = dateKey(workout.finishedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const days = weeks * 7;
  const today = new Date();
  const result: FrequencyDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    result.push({ dateKey: key, count: counts.get(key) ?? 0, dayOfWeek: d.getDay() });
  }
  return result;
}

export type ExerciseHistoryPoint = { dateKey: string; label: string; topWeight: number; volume: number };

/** All exercise names that appear anywhere in history, ordered by how often they're logged. */
export function loggedExerciseNames(history: RecentWorkout[]): string[] {
  const counts = new Map<string, number>();
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      counts.set(set.exerciseName, (counts.get(set.exerciseName) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

/** Per-session top weight and volume for one exercise, oldest first. */
export function exerciseProgress(history: RecentWorkout[], exerciseName: string): ExerciseHistoryPoint[] {
  const points: ExerciseHistoryPoint[] = [];
  const sorted = history.slice().sort((a, b) => (a.finishedAt < b.finishedAt ? -1 : 1));
  for (const workout of sorted) {
    const sets = (workout.sets ?? []).filter((s) => s.exerciseName === exerciseName);
    if (sets.length === 0) continue;
    points.push({
      dateKey: dateKey(workout.finishedAt),
      label: new Date(workout.finishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      topWeight: Math.max(...sets.map((s) => s.weight)),
      volume: sets.reduce((sum, s) => sum + s.volume, 0),
    });
  }
  return points;
}

export type HistoryGroup = { dateKey: string; label: string; workouts: RecentWorkout[]; totalVolume: number };

/** Finished workouts grouped by calendar day, most recent day first. */
export function groupWorkoutsByDate(history: RecentWorkout[]): HistoryGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, RecentWorkout[]>();
  const sorted = history.slice().sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
  for (const workout of sorted) {
    const key = dateKey(workout.finishedAt);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(workout);
  }
  const today = dateKey(new Date().toISOString());
  const yesterday = dateKey(new Date(Date.now() - DAY_MS).toISOString());
  return order.map((key) => {
    const workouts = buckets.get(key)!;
    const label = key === today
      ? 'Today'
      : key === yesterday
        ? 'Yesterday'
        : new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return {
      dateKey: key,
      label,
      workouts,
      totalVolume: workouts.reduce((sum, w) => sum + w.totalVolume, 0),
    };
  });
}

/** Consecutive-day workout streak ending today (or yesterday, if today has no workout yet). */
export function currentStreak(history: RecentWorkout[]): number {
  const days = new Set(history.map((workout) => dateKey(workout.finishedAt)));
  const cursor = new Date();
  let key = dateKey(cursor.toISOString());
  if (!days.has(key)) {
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor.toISOString());
    if (!days.has(key)) return 0;
  }
  let streak = 0;
  while (days.has(key)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor.toISOString());
  }
  return streak;
}

export type PersonalRecord = { exerciseName: string; maxWeight: number; maxVolumeSession: number };

export function personalRecord(history: RecentWorkout[], exerciseName: string): PersonalRecord | null {
  const points = exerciseProgress(history, exerciseName);
  if (points.length === 0) return null;
  return {
    exerciseName,
    maxWeight: Math.max(...points.map((p) => p.topWeight)),
    maxVolumeSession: Math.max(...points.map((p) => p.volume)),
  };
}
