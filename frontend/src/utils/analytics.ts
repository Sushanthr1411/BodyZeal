import type { RecentWorkout } from '@/lib/recentWorkouts';
import { EXERCISES, MUSCLE_GROUP_OPTIONS } from '@/data/exercises';
import type { Equipment, MuscleGroup } from '@/types/workout';

const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function isToday(iso: string): boolean {
  return dateKey(iso) === dateKey(new Date().toISOString());
}

/** Finished workouts from the calendar day that has just started/ended (today), if any. */
export function todaysWorkouts(history: RecentWorkout[]): RecentWorkout[] {
  return history.filter((workout) => isToday(workout.finishedAt));
}

/**
 * Which exercises had a new heaviest-weight personal record set today,
 * compared against every prior day in `history` (today's own entries
 * excluded from the "prior best" baseline — otherwise today would always
 * beat itself). A first-ever attempt at an exercise counts too — any weight
 * beats a nonexistent baseline of 0, same as most fitness apps treat it.
 * Named, not just counted, so the UI can say exactly what was beaten.
 */
export function todaysPersonalRecordExercises(
  history: RecentWorkout[],
  todaysSets: { exerciseName: string; weight: number }[],
): string[] {
  const bestBeforeToday = new Map<string, number>();
  for (const workout of history) {
    if (isToday(workout.finishedAt)) continue;
    for (const set of workout.sets ?? []) {
      const current = bestBeforeToday.get(set.exerciseName) ?? 0;
      if (set.weight > current) bestBeforeToday.set(set.exerciseName, set.weight);
    }
  }
  const bestToday = new Map<string, number>();
  for (const set of todaysSets) {
    const current = bestToday.get(set.exerciseName) ?? 0;
    if (set.weight > current) bestToday.set(set.exerciseName, set.weight);
  }
  const names: string[] = [];
  for (const [exerciseName, weight] of bestToday) {
    if (weight > (bestBeforeToday.get(exerciseName) ?? 0)) names.push(exerciseName);
  }
  return names;
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

/** Volume per muscle group across all history, zero-filled for groups never trained. */
export function muscleGroupVolumeAll(history: RecentWorkout[]): Record<MuscleGroup, number> {
  const totals = Object.fromEntries(MUSCLE_GROUP_OPTIONS.map((group) => [group, 0])) as Record<MuscleGroup, number>;
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      const group = muscleGroupFor(set.exerciseName);
      if (group) totals[group] += set.volume;
    }
  }
  return totals;
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

function equipmentFor(exerciseName: string): Equipment | null {
  return EXERCISES.find((e) => e.name === exerciseName)?.equipment ?? null;
}

export type EquipmentSlice = { equipment: string; volume: number; percent: number };

/** Volume grouped by equipment type across all history — a different cut than
 * muscle group (free weights vs machines vs bodyweight), from the same
 * exercise metadata muscleGroupFor already looks up. Only 7 equipment types
 * exist in the library, so no "Other" bucket is needed here. */
export function equipmentBreakdown(history: RecentWorkout[]): EquipmentSlice[] {
  const totals = new Map<string, number>();
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      const equipment = equipmentFor(set.exerciseName);
      if (!equipment) continue;
      totals.set(equipment, (totals.get(equipment) ?? 0) + set.volume);
    }
  }
  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const grandTotal = sorted.reduce((sum, [, v]) => sum + v, 0) || 1;
  return sorted.map(([equipment, volume]) => ({
    equipment,
    volume,
    percent: Math.round((volume / grandTotal) * 100),
  }));
}

export type TopExercise = { exerciseName: string; volume: number; percent: number };

/** Top exercises by total volume across all history — same shape/rules as
 * muscleGroupBreakdown() (top N + it just stops there, no "Other" bucket:
 * unlike muscle groups there's no natural catch-all category for exercises). */
export function topExercisesByVolume(history: RecentWorkout[], limit = 6): TopExercise[] {
  const totals = new Map<string, number>();
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      totals.set(set.exerciseName, (totals.get(set.exerciseName) ?? 0) + set.volume);
    }
  }
  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
  const grandTotal = sorted.reduce((sum, [, v]) => sum + v, 0) || 1;
  return sorted.map(([exerciseName, volume]) => ({
    exerciseName,
    volume,
    percent: Math.round((volume / grandTotal) * 100),
  }));
}

export type SessionDuration = { dateKey: string; label: string; minutes: number };

/** Duration of the most recent finished sessions that actually recorded one
 * (durationSeconds > 0 — quick-log-only "sessions" never have one), oldest
 * first so it reads left-to-right as a trend, like every other chart here. */
export function recentSessionDurations(history: RecentWorkout[], limit = 10): SessionDuration[] {
  return history
    .filter((workout) => (workout.durationSeconds ?? 0) > 0)
    .slice() // history arrives newest-first; take the most recent `limit`, then reverse to oldest-first
    .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1))
    .slice(0, limit)
    .reverse()
    .map((workout) => ({
      dateKey: dateKey(workout.finishedAt),
      label: new Date(workout.finishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: Math.round((workout.durationSeconds ?? 0) / 60),
    }));
}

export type WeekComparison = {
  thisWeek: { volume: number; workouts: number; sets: number };
  lastWeek: { volume: number; workouts: number; sets: number };
};

/** This calendar week (Sun–Sat, matching frequencyGrid's week columns) vs the
 * one before it — a quick momentum read, not a chart (a delta is a stat-tile job). */
export function weekOverWeekStats(history: RecentWorkout[]): WeekComparison {
  const now = new Date();
  const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * DAY_MS);

  const empty = { volume: 0, workouts: 0, sets: 0 };
  const thisWeek = { ...empty };
  const lastWeek = { ...empty };
  for (const workout of history) {
    const finished = new Date(workout.finishedAt).getTime();
    const sets = workout.totalSets ?? workout.sets?.length ?? 0;
    if (finished >= startOfThisWeek.getTime()) {
      thisWeek.volume += workout.totalVolume;
      thisWeek.workouts += 1;
      thisWeek.sets += sets;
    } else if (finished >= startOfLastWeek.getTime()) {
      lastWeek.volume += workout.totalVolume;
      lastWeek.workouts += 1;
      lastWeek.sets += sets;
    }
  }
  return { thisWeek, lastWeek };
}

export type MonthVolume = { monthKey: string; label: string; volume: number };

/** Total volume per calendar month for the trailing `months` window, oldest
 * first, zero-filled — the longer-horizon counterpart to volumeByDay's 7-day
 * view, for seeing macro progression instead of this week's blips. */
export function volumeByMonth(history: RecentWorkout[], months = 6): MonthVolume[] {
  const now = new Date();
  const buckets = new Map<string, number>();
  const order: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    order.push(key);
    buckets.set(key, 0);
  }
  for (const workout of history) {
    const d = new Date(workout.finishedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + workout.totalVolume);
  }
  return order.map((key) => {
    const [year, month] = key.split('-').map(Number);
    return {
      monthKey: key,
      label: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' }),
      volume: buckets.get(key)!,
    };
  });
}

export type RepRangeLabel = 'Strength' | 'Hypertrophy' | 'Endurance';
export type RepRangeSlice = { label: RepRangeLabel; range: string; volume: number; percent: number };

/**
 * Volume split by rep range — 1–5 reps (strength), 6–12 (hypertrophy), 13+
 * (endurance) — a training-style lens on the same sets/reps data that's
 * otherwise only ever summed by muscle group or exercise, never by *how*
 * the lifting was done. Bucketed by volume (not a raw set count) because a
 * logged entry already represents a variable number of physical sets, same
 * reasoning as muscleGroupBreakdown/topExercisesByVolume.
 */
export function repRangeDistribution(history: RecentWorkout[]): RepRangeSlice[] {
  let strength = 0;
  let hypertrophy = 0;
  let endurance = 0;
  for (const workout of history) {
    for (const set of workout.sets ?? []) {
      if (set.reps <= 5) strength += set.volume;
      else if (set.reps <= 12) hypertrophy += set.volume;
      else endurance += set.volume;
    }
  }
  const total = strength + hypertrophy + endurance || 1;
  return [
    { label: 'Strength', range: '1–5 reps', volume: strength, percent: Math.round((strength / total) * 100) },
    { label: 'Hypertrophy', range: '6–12 reps', volume: hypertrophy, percent: Math.round((hypertrophy / total) * 100) },
    { label: 'Endurance', range: '13+ reps', volume: endurance, percent: Math.round((endurance / total) * 100) },
  ];
}

export type WeekdayCount = { day: string; dayIndex: number; count: number };

/** Workout count by day of week, all-time — which days you actually train on,
 * distinct from the frequency heatmap's chronological calendar view of *when*
 * (this collapses the calendar into a 7-bucket weekly rhythm instead). */
export function workoutsByDayOfWeek(history: RecentWorkout[]): WeekdayCount[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = new Array(7).fill(0) as number[];
  for (const workout of history) {
    counts[new Date(workout.finishedAt).getDay()] += 1;
  }
  return labels.map((day, dayIndex) => ({ day, dayIndex, count: counts[dayIndex] }));
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

export type ExerciseHistoryPoint = {
  dateKey: string;
  label: string;
  finishedAt: string;
  topWeight: number;
  volume: number;
  setCount: number;
  topReps: number;
};

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

/** Per-session summary (top weight, reps at that weight, set count, total volume) for one exercise, oldest first. */
export function exerciseProgress(history: RecentWorkout[], exerciseName: string): ExerciseHistoryPoint[] {
  const points: ExerciseHistoryPoint[] = [];
  const sorted = history.slice().sort((a, b) => (a.finishedAt < b.finishedAt ? -1 : 1));
  for (const workout of sorted) {
    const sets = (workout.sets ?? []).filter((s) => s.exerciseName === exerciseName);
    if (sets.length === 0) continue;
    const topWeight = Math.max(...sets.map((s) => s.weight));
    const topSet = sets.find((s) => s.weight === topWeight) ?? sets[0];
    points.push({
      dateKey: dateKey(workout.finishedAt),
      label: new Date(workout.finishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      finishedAt: workout.finishedAt,
      topWeight,
      volume: sets.reduce((sum, s) => sum + s.volume, 0),
      setCount: sets.length,
      topReps: topSet.reps,
    });
  }
  return points;
}

export type ExerciseStats = {
  timesPerformed: number;
  bestWeight: number;
  bestReps: number;
  bestSetVolume: number;
  totalVolume: number;
  heaviestWeightRecord: { weight: number; reps: number };
  highestVolumeSession: { volume: number; label: string; dateKey: string };
  bestRepsRecord: { reps: number; weight: number };
};

/** Lifetime performance stats for one exercise, across all history (unaffected by any chart time-range filter). */
export function exerciseStats(history: RecentWorkout[], exerciseName: string): ExerciseStats | null {
  const allSets = history.flatMap((workout) => (workout.sets ?? []).filter((set) => set.exerciseName === exerciseName));
  if (allSets.length === 0) return null;

  const points = exerciseProgress(history, exerciseName);
  const heaviestSet = allSets.reduce((best, set) => (set.weight > best.weight ? set : best));
  const bestRepsSet = allSets.reduce((best, set) => (set.reps > best.reps ? set : best));
  const bestVolumeSet = allSets.reduce((best, set) => (set.volume > best.volume ? set : best));
  const highestVolumePoint = points.reduce((best, point) => (point.volume > best.volume ? point : best), points[0]);

  return {
    timesPerformed: points.length,
    bestWeight: heaviestSet.weight,
    bestReps: bestRepsSet.reps,
    bestSetVolume: bestVolumeSet.volume,
    totalVolume: allSets.reduce((sum, set) => sum + set.volume, 0),
    heaviestWeightRecord: { weight: heaviestSet.weight, reps: heaviestSet.reps },
    highestVolumeSession: { volume: highestVolumePoint.volume, label: highestVolumePoint.label, dateKey: highestVolumePoint.dateKey },
    bestRepsRecord: { reps: bestRepsSet.reps, weight: bestRepsSet.weight },
  };
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
  return currentStreakDates(history).length;
}

/**
 * The actual date keys making up the active streak (see currentStreak) — only days
 * with a finished workout ever appear here, never a day the user merely opened the
 * app on. Used to mark streak days on the calendar; most-recent day first.
 */
export function currentStreakDates(history: RecentWorkout[]): string[] {
  const days = new Set(history.map((workout) => dateKey(workout.finishedAt)));
  const cursor = new Date();
  let key = dateKey(cursor.toISOString());
  if (!days.has(key)) {
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor.toISOString());
    if (!days.has(key)) return [];
  }
  const dates: string[] = [];
  while (days.has(key)) {
    dates.push(key);
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor.toISOString());
  }
  return dates;
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
