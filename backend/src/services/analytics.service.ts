import { SessionStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { toFrontendExercise, toFrontendMuscleGroup, type FrontendExercise } from '../mappers/exercise.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;

// Every function below is scoped to `session.status = FINISHED` — matching
// the frontend, which computes all of this from `loadRecentWorkouts()`
// (finished workouts only). Quick-log entries (sessionId = null, Phase 3D)
// are deliberately excluded everywhere here, same as the frontend never
// merges todayLog into `history` for any of these calculations.
const finishedOnly = { status: SessionStatus.FINISHED } as const;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ---- Summary ----

export type AnalyticsSummary = {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  currentStreak: number;
};

export async function getSummary(userId: string): Promise<AnalyticsSummary> {
  const [agg, streak] = await Promise.all([
    prisma.workoutSession.aggregate({
      where: { userId, ...finishedOnly },
      _count: { _all: true },
      _sum: { totalVolume: true, totalSets: true },
    }),
    getCurrentStreak(userId),
  ]);
  return {
    totalWorkouts: agg._count._all,
    totalVolume: agg._sum.totalVolume ?? 0,
    totalSets: agg._sum.totalSets ?? 0,
    currentStreak: streak,
  };
}

// ---- Volume by day ----

export type DayVolume = { dateKey: string; label: string; volume: number };

/** Matches frontend/src/utils/analytics.ts's volumeByDay() exactly: oldest-
 * first, zero-filled for days with no finished workout. */
export async function getVolumeByDay(userId: string, days: number): Promise<DayVolume[]> {
  const today = new Date();
  const cutoff = new Date(today.getTime() - days * DAY_MS);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, ...finishedOnly, finishedAt: { gte: cutoff } },
    select: { finishedAt: true, totalVolume: true },
  });

  const buckets = new Map<string, number>();
  const order: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKey(new Date(today.getTime() - i * DAY_MS));
    order.push(key);
    buckets.set(key, 0);
  }
  for (const s of sessions) {
    const key = dateKey(s.finishedAt!);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + s.totalVolume);
  }
  return order.map((key) => ({
    dateKey: key,
    label: new Date(key).toLocaleDateString('en-US', { weekday: 'short' }),
    volume: buckets.get(key)!,
  }));
}

// ---- Muscle group split ----

export type MuscleGroupSlice = { muscleGroup: string; volume: number; percent: number };

/** Matches muscleGroupBreakdown(): top 6 muscle groups by volume + "Other". */
export async function getMuscleGroupSplit(userId: string, days: number | undefined): Promise<MuscleGroupSlice[]> {
  const cutoff = days !== undefined ? new Date(Date.now() - days * DAY_MS) : undefined;

  const sets = await prisma.workoutSet.findMany({
    where: {
      userId,
      session: { ...finishedOnly, ...(cutoff ? { finishedAt: { gte: cutoff } } : {}) },
    },
    select: { volume: true, exercise: { select: { muscleGroup: true } } },
  });

  const totals = new Map<string, number>();
  for (const s of sets) {
    const group = toFrontendMuscleGroup(s.exercise.muscleGroup);
    totals.set(group, (totals.get(group) ?? 0) + s.volume);
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

// ---- Frequency heatmap ----

export type FrequencyDay = { dateKey: string; count: number; dayOfWeek: number };

/** Matches frequencyGrid(): one entry per day for the trailing `weeks` window. */
export async function getFrequency(userId: string, weeks: number): Promise<FrequencyDay[]> {
  const days = weeks * 7;
  const today = new Date();
  const cutoff = new Date(today.getTime() - days * DAY_MS);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, ...finishedOnly, finishedAt: { gte: cutoff } },
    select: { finishedAt: true },
  });

  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = dateKey(s.finishedAt!);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: FrequencyDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = dateKey(d);
    result.push({ dateKey: key, count: counts.get(key) ?? 0, dayOfWeek: d.getDay() });
  }
  return result;
}

// ---- Streak ----

/** Matches currentStreak(): consecutive-day streak ending today, or
 * yesterday if today has no finished workout yet. */
export async function getCurrentStreak(userId: string): Promise<number> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, ...finishedOnly },
    select: { finishedAt: true },
  });
  const days = new Set(sessions.map((s) => dateKey(s.finishedAt!)));

  const cursor = new Date();
  let key = dateKey(cursor);
  if (!days.has(key)) {
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor);
    if (!days.has(key)) return 0;
  }
  let streak = 0;
  while (days.has(key)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    key = dateKey(cursor);
  }
  return streak;
}

// ---- History grouped by date ----

export type HistoryGroupWorkout = {
  id: string;
  name: string;
  finishedAt: string;
  totalVolume: number;
  totalSets: number;
  durationSeconds: number;
};
export type HistoryGroup = { dateKey: string; label: string; workouts: HistoryGroupWorkout[]; totalVolume: number };

/** Matches groupWorkoutsByDate(): finished workouts grouped by calendar day, most recent day first. */
export async function getHistoryByDate(userId: string): Promise<HistoryGroup[]> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, ...finishedOnly },
    orderBy: { finishedAt: 'desc' },
  });

  const order: string[] = [];
  const buckets = new Map<string, HistoryGroupWorkout[]>();
  for (const s of sessions) {
    const key = dateKey(s.finishedAt!);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push({
      id: s.id,
      name: s.name,
      finishedAt: s.finishedAt!.toISOString(),
      totalVolume: s.totalVolume,
      totalSets: s.totalSets,
      durationSeconds: s.durationSeconds ?? 0,
    });
  }

  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - DAY_MS));
  return order.map((key) => {
    const workouts = buckets.get(key)!;
    const label =
      key === today
        ? 'Today'
        : key === yesterday
          ? 'Yesterday'
          : new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return { dateKey: key, label, workouts, totalVolume: workouts.reduce((sum, w) => sum + w.totalVolume, 0) };
  });
}

// ---- Logged exercises ----

/** Exercises that appear anywhere in the user's finished history, ordered by how often they're logged. */
export async function getLoggedExercises(userId: string): Promise<FrontendExercise[]> {
  const grouped = await prisma.workoutSet.groupBy({
    by: ['exerciseId'],
    where: { userId, session: finishedOnly },
    _count: { _all: true },
    orderBy: { _count: { exerciseId: 'desc' } },
  });
  if (grouped.length === 0) return [];

  const exercises = await prisma.exercise.findMany({ where: { id: { in: grouped.map((g) => g.exerciseId) } } });
  const byId = new Map(exercises.map((e) => [e.id, e]));
  return grouped.map((g) => byId.get(g.exerciseId)).filter((e): e is NonNullable<typeof e> => Boolean(e)).map(toFrontendExercise);
}

// ---- Per-exercise progress & stats ----

export type ExerciseHistoryPoint = {
  dateKey: string;
  label: string;
  finishedAt: string;
  topWeight: number;
  volume: number;
  setCount: number;
  topReps: number;
};

/** Shared by both /progress and /stats — one query, grouped by session,
 * mirroring exerciseProgress()'s per-session reduction exactly. */
async function computeExercisePoints(userId: string, exerciseId: string): Promise<ExerciseHistoryPoint[]> {
  const sets = await prisma.workoutSet.findMany({
    where: { userId, exerciseId, session: finishedOnly },
    include: { session: { select: { id: true, finishedAt: true } } },
    orderBy: { session: { finishedAt: 'asc' } },
  });

  const order: string[] = [];
  const bySession = new Map<string, typeof sets>();
  for (const s of sets) {
    const sessionId = s.session!.id;
    if (!bySession.has(sessionId)) {
      bySession.set(sessionId, []);
      order.push(sessionId);
    }
    bySession.get(sessionId)!.push(s);
  }

  return order.map((sessionId) => {
    const sessionSets = bySession.get(sessionId)!;
    const finishedAt = sessionSets[0]!.session!.finishedAt!;
    const topWeight = Math.max(...sessionSets.map((s) => s.weight));
    const topSet = sessionSets.find((s) => s.weight === topWeight) ?? sessionSets[0]!;
    return {
      dateKey: dateKey(finishedAt),
      label: finishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      finishedAt: finishedAt.toISOString(),
      topWeight,
      volume: sessionSets.reduce((sum, s) => sum + s.volume, 0),
      setCount: sessionSets.length,
      topReps: topSet.reps,
    };
  });
}

async function assertExerciseExists(exerciseId: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) throw AppError.notFound(`Exercise "${exerciseId}" not found`);
  return exercise;
}

const RANGE_DAYS: Record<'7d' | '30d' | '3m' | 'all', number | null> = {
  '7d': 7,
  '30d': 30,
  '3m': 90,
  all: null,
};

export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  range: '7d' | '30d' | '3m' | 'all',
): Promise<ExerciseHistoryPoint[]> {
  await assertExerciseExists(exerciseId);
  const points = await computeExercisePoints(userId, exerciseId);
  const rangeDays = RANGE_DAYS[range];
  if (rangeDays === null) return points;
  const cutoff = Date.now() - rangeDays * DAY_MS;
  return points.filter((p) => new Date(p.finishedAt).getTime() >= cutoff);
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
  // Additive — mirrors personalRecord()'s two fields, which are themselves
  // always derivable from the values above (max-of-per-session-maxes equals
  // the global max), consolidated here instead of a separate endpoint.
  personalRecord: { exerciseName: string; maxWeight: number; maxVolumeSession: number };
};

/** Lifetime stats — always computed over ALL history, never range-filtered
 * (matches exerciseStats()'s own doc comment). Returns null if the exercise
 * has never been logged, matching the frontend's null-for-no-history case. */
export async function getExerciseStats(userId: string, exerciseId: string): Promise<ExerciseStats | null> {
  const exercise = await assertExerciseExists(exerciseId);
  const points = await computeExercisePoints(userId, exerciseId);
  if (points.length === 0) return null;

  const allSets = await prisma.workoutSet.findMany({
    where: { userId, exerciseId, session: finishedOnly },
    select: { weight: true, reps: true, volume: true },
  });

  const heaviestSet = allSets.reduce((best, s) => (s.weight > best.weight ? s : best));
  const bestRepsSet = allSets.reduce((best, s) => (s.reps > best.reps ? s : best));
  const bestVolumeSet = allSets.reduce((best, s) => (s.volume > best.volume ? s : best));
  const highestVolumePoint = points.reduce((best, p) => (p.volume > best.volume ? p : best), points[0]!);

  return {
    timesPerformed: points.length,
    bestWeight: heaviestSet.weight,
    bestReps: bestRepsSet.reps,
    bestSetVolume: bestVolumeSet.volume,
    totalVolume: allSets.reduce((sum, s) => sum + s.volume, 0),
    heaviestWeightRecord: { weight: heaviestSet.weight, reps: heaviestSet.reps },
    highestVolumeSession: { volume: highestVolumePoint.volume, label: highestVolumePoint.label, dateKey: highestVolumePoint.dateKey },
    bestRepsRecord: { reps: bestRepsSet.reps, weight: bestRepsSet.weight },
    personalRecord: {
      exerciseName: exercise.name,
      maxWeight: heaviestSet.weight,
      maxVolumeSession: highestVolumePoint.volume,
    },
  };
}
