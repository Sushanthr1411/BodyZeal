import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Search, Trophy, Weight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import PersonalRecordCard from '@/components/records/PersonalRecordCard';
import { EXERCISES } from '@/data/exercises';
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import {
  exerciseStats,
  loggedExerciseNames,
  todaysPersonalRecordExercises,
  todaysWorkouts,
  type ExerciseStats,
} from '@/utils/analytics';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import type { Exercise } from '@/types/workout';

type SortKey = 'heaviest' | 'frequent' | 'az';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'heaviest', label: 'Heaviest' },
  { key: 'frequent', label: 'Most trained' },
  { key: 'az', label: 'A–Z' },
];

type RecordEntry = { exercise: Exercise; stats: ExerciseStats };

export default function PersonalRecordsPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [sort, setSort] = useState<SortKey>('heaviest');

  useEffect(() => {
    let cancelled = false;
    loadRecentWorkouts(200).then((loaded) => {
      if (!cancelled) {
        setHistory(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const allRecords: RecordEntry[] = useMemo(() => {
    return loggedExerciseNames(history)
      .map((name) => {
        const exercise = EXERCISES.find((e) => e.name === name);
        const stats = exerciseStats(history, name);
        if (!exercise || !stats) return null;
        return { exercise, stats };
      })
      .filter((entry): entry is RecordEntry => entry !== null);
  }, [history]);

  // Same rule as the Dashboard's "New PRs today" tile — recomputed here from the
  // full history so it stays true even navigating straight to this page.
  const todaysSets = useMemo(() => todaysWorkouts(history).flatMap((w) => w.sets ?? []), [history]);
  const newTodayNames = useMemo(
    () => new Set(todaysPersonalRecordExercises(history, todaysSets)),
    [history, todaysSets],
  );

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = allRecords.filter(({ exercise }) => {
      if (equipment !== ALL_EQUIPMENT && exercise.equipment !== equipment) return false;
      if (muscleGroup !== ALL_MUSCLE_GROUPS && exercise.muscleGroup !== muscleGroup) return false;
      if (query && !exercise.name.toLowerCase().includes(query)) return false;
      return true;
    });
    const sorted = filtered.slice();
    if (sort === 'heaviest') sorted.sort((a, b) => b.stats.bestWeight - a.stats.bestWeight);
    else if (sort === 'frequent') sorted.sort((a, b) => b.stats.timesPerformed - a.stats.timesPerformed);
    else sorted.sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));
    return sorted;
  }, [allRecords, search, equipment, muscleGroup, sort]);

  const heaviestOverall = allRecords.reduce<RecordEntry | null>(
    (best, entry) => (!best || entry.stats.bestWeight > best.stats.bestWeight ? entry : best),
    null,
  );

  return (
    <DashboardLayout>
      <PageHeader title="Personal Records" description="Your best-ever performance on every exercise you've logged." />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="card flex items-center justify-center gap-3 p-12 text-sm text-ink-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
              Loading your records...
            </div>
          ) : allRecords.length === 0 ? (
            <div className="card p-5">
              <EmptyState
                icon={Trophy}
                title="No records yet"
                description="Log a set on the Log Workout page or the Dashboard, and your personal records will start showing up here."
              />
            </div>
          ) : (
            <>
              {/* Stat summary */}
              <div className="card flex flex-col divide-y divide-ink-200/70 overflow-hidden sm:flex-row sm:divide-x sm:divide-y-0">
                <div className="flex flex-1 items-center gap-4 bg-aqua-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-aqua-50 text-aqua-600">
                    <Dumbbell className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">Exercises tracked</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={allRecords.length} />
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-4 bg-violet-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Weight className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">Heaviest lift</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={heaviestOverall?.stats.bestWeight ?? 0} />{' '}
                      <span className="text-base font-semibold text-ink-400">kg</span>
                    </p>
                    {heaviestOverall && <p className="truncate text-xs text-ink-500">{heaviestOverall.exercise.name}</p>}
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-4 bg-coral-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
                    <Flame className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">New PRs today</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={newTodayNames.size} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Search, sort, filters */}
              <div className="card relative mt-6 p-5">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
                </div>
                <div className="relative grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search exercises..."
                      className="input pl-9"
                    />
                  </div>
                  <div className="flex rounded-lg bg-ink-100 p-0.5">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSort(option.key)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          sort === option.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative mt-3">
                  <ExerciseFilters
                    equipment={equipment}
                    muscleGroup={muscleGroup}
                    onEquipmentChange={setEquipment}
                    onMuscleGroupChange={setMuscleGroup}
                  />
                </div>
              </div>

              {/* Records grid */}
              {visibleRecords.length === 0 ? (
                <div className="card mt-6 p-8">
                  <EmptyState icon={Search} title="No matching exercises" description="Try a different search or filter." />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleRecords.map((record, index) => (
                    <motion.div
                      key={record.exercise.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <PersonalRecordCard
                        exercise={record.exercise}
                        stats={record.stats}
                        isNew={newTodayNames.has(record.exercise.name)}
                        onSelect={() => navigate(`/exercises/${record.exercise.id}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
