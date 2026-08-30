import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Dumbbell, Flame, History, ListChecks, Weight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import WorkoutRecordCard from '@/components/history/WorkoutRecordCard';
import { deleteWorkout, loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import { currentStreak, currentStreakDates, dateKey, groupWorkoutsByDate } from '@/utils/analytics';
import { formatTime } from '@/utils/workout';

type ViewMode = 'day' | 'all';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function intensityColor(count: number): string {
  if (count <= 0) return 'transparent';
  if (count === 1) return '#D3E68C';
  if (count === 2) return '#9FC232';
  return '#526615';
}

/**
 * Merges the old History (chronological timeline) and Calendar (month grid +
 * day picker) pages into one, with an explicit toggle instead of stacking
 * both at once: "Day view" shows the calendar and just that day's log,
 * "All history" shows the full chronological timeline — never both together.
 */
export default function ExerciseHistoryPage() {
  const [history, setHistory] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('day');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Higher cap than the old pages' default 60 — a calendar invites browsing
    // several months back, so it needs more of the tail than a short list did.
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

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const todayKey = dateKey(new Date().toISOString());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, RecentWorkout[]>();
    for (const workout of history) {
      const key = dateKey(workout.finishedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(workout);
    }
    return map;
  }, [history]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const list: { day: number; key: string }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      // UTC-based key, matching how workout timestamps are stored (toISOString) elsewhere in the app.
      const key = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
      list.push({ day, key });
    }
    return list;
  }, [year, month, daysInMonth]);

  const selectedWorkouts = workoutsByDate.get(selectedKey) ?? [];
  const selectedDate = new Date(`${selectedKey}T00:00:00Z`);
  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const dayVolume = selectedWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const daySets = selectedWorkouts.reduce((sum, w) => sum + (w.totalSets ?? w.sets?.length ?? 0), 0);
  const dayDuration = selectedWorkouts.reduce((sum, w) => sum + (w.durationSeconds ?? 0), 0);

  const groups = useMemo(() => groupWorkoutsByDate(history), [history]);
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((total, workout) => total + workout.totalVolume, 0);
  const streak = currentStreak(history);
  // Only days with an actual finished workout ever land here — see currentStreakDates.
  const streakDates = useMemo(() => new Set(currentStreakDates(history)), [history]);

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  function handleDeleteWorkout(workout: RecentWorkout) {
    if (!workout.id || deletingId) return;
    if (!window.confirm(`Delete "${workout.name}"? This permanently removes it and every set in it from your history and stats.`)) {
      return;
    }
    const id = workout.id;
    setDeleteError('');
    setDeletingId(id);
    // Optimistic — removing it from `history` here also updates the stat row,
    // calendar dots/streak markers, and both views at once, since they're all
    // derived from this same state.
    const previous = history;
    setHistory((current) => current.filter((w) => w.id !== id));
    deleteWorkout(id)
      .catch(() => {
        setHistory(previous); // rollback — never let the UI claim success the backend didn't confirm
        setDeleteError("Couldn't delete that workout — try again.");
      })
      .finally(() => setDeletingId(null));
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Exercise History"
        description="Every finished workout — pick a day on the calendar, or browse the full chronological log."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          {deleteError && (
            <p role="alert" className="mb-4 text-sm font-medium text-red-600">
              {deleteError}
            </p>
          )}
          {loading ? (
            <div className="card flex items-center justify-center gap-3 p-12 text-sm text-ink-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
              Loading your history...
            </div>
          ) : history.length === 0 ? (
            <div className="card p-5">
              <EmptyState
                icon={History}
                title="No workout history yet"
                description="Finish a workout on the Log Workout page and it will appear here, on the calendar and in your full history."
              />
            </div>
          ) : (
            <>
              {/* Stat summary */}
              <div className="card flex flex-col divide-y divide-ink-200/70 overflow-hidden sm:flex-row sm:divide-x sm:divide-y-0">
                <div className="flex flex-1 items-center gap-4 bg-energy-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-energy-50 text-energy-600">
                    <ListChecks className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">Workouts finished</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={totalWorkouts} />
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-4 bg-violet-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Weight className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">Total volume lifted</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={totalVolume} /> <span className="text-base font-semibold text-ink-400">kg</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-4 bg-coral-50/40 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
                    <Flame className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-500">Current streak</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <AnimatedNumber value={streak} />{' '}
                      <span className="text-base font-semibold text-ink-400">{streak === 1 ? 'day' : 'days'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* View toggle */}
              <div className="mt-6 flex justify-center sm:justify-start">
                <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1 shadow-soft">
                  <button
                    type="button"
                    onClick={() => setView('day')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      view === 'day' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('all')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      view === 'all' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    All history
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {view === 'day' ? (
                  <motion.div
                    key="day"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5"
                  >
                    {/* Month grid */}
                    <div className="card p-5 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-extrabold tracking-tight text-ink-900">{monthLabel}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous month"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            aria-label="Next month"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <motion.div
                        key={monthLabel}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-4 grid grid-cols-7 gap-1"
                      >
                        {WEEKDAY_LABELS.map((label, i) => (
                          <span key={i} className="grid h-6 place-items-center text-[11px] font-semibold uppercase text-ink-400">
                            {label}
                          </span>
                        ))}

                        {Array.from({ length: firstWeekday }, (_, i) => (
                          <span key={`pad-${i}`} />
                        ))}

                        {cells.map(({ day, key }) => {
                          const count = workoutsByDate.get(key)?.length ?? 0;
                          const isSelected = key === selectedKey;
                          const isToday = key === todayKey;
                          const isStreakDay = streakDates.has(key);
                          return (
                            <motion.button
                              key={key}
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() => setSelectedKey(key)}
                              className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-ink-900 text-white'
                                  : isStreakDay
                                    ? 'bg-coral-50 text-ink-900 ring-1 ring-inset ring-coral-400'
                                    : isToday
                                      ? 'bg-energy-50 text-ink-900 ring-1 ring-inset ring-energy-300'
                                      : 'text-ink-700 hover:bg-ink-100'
                              }`}
                            >
                              {day}
                              {isStreakDay ? (
                                <Flame
                                  className="h-3 w-3"
                                  strokeWidth={2.5}
                                  style={{ color: isSelected ? '#D3E68C' : '#C96936' }}
                                  fill={isSelected ? '#D3E68C' : '#C96936'}
                                />
                              ) : (
                                count > 0 && (
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: isSelected ? '#9FC232' : intensityColor(count) }}
                                  />
                                )
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-3 text-[11px] text-ink-500">
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-3 w-3" strokeWidth={2.5} style={{ color: '#C96936' }} fill="#C96936" />
                          Current streak
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: intensityColor(1) }} />
                          Workout logged
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-md bg-energy-50 ring-1 ring-inset ring-energy-300" />
                          Today
                        </span>
                      </div>
                    </div>

                    {/* Selected day — full log, inline */}
                    <div className="lg:col-span-3">
                      <div className="card p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-energy-400">
                              <CalendarDays className="h-4.5 w-4.5" strokeWidth={2} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink-900">{selectedLabel}</p>
                              {selectedKey === todayKey && <p className="text-xs text-energy-600">Today</p>}
                            </div>
                          </div>
                          {selectedWorkouts.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="chip border-ink-200 bg-white text-ink-700">
                                <ListChecks className="h-3 w-3 text-ink-400" />
                                {daySets} sets
                              </span>
                              {dayDuration > 0 && (
                                <span className="chip border-ink-200 bg-white text-ink-700">
                                  <Clock className="h-3 w-3 text-ink-400" />
                                  {formatTime(dayDuration)}
                                </span>
                              )}
                              <span className="chip border-energy-300/60 bg-energy-50 text-energy-800">
                                {dayVolume.toLocaleString()} kg
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedWorkouts.length === 0 ? (
                        <div className="card mt-4 p-8">
                          <EmptyState icon={Dumbbell} title="No workouts logged" description="Nothing was finished on this day." />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {selectedWorkouts.map((workout, index) => (
                            <motion.div
                              key={`${workout.name}-${workout.finishedAt}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: index * 0.05 }}
                            >
                              <WorkoutRecordCard
                                workout={workout}
                                idPrefix={`${selectedKey}-${index}`}
                                onDelete={handleDeleteWorkout}
                                isDeleting={workout.id === deletingId}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="all"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6"
                  >
                    <div className="mb-5 flex items-center gap-2">
                      <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">Full timeline</h2>
                      <span className="chip border-ink-200 bg-white text-ink-600">
                        {groups.length} {groups.length === 1 ? 'day' : 'days'} logged
                      </span>
                    </div>

                    <div className="space-y-10">
                      {groups.map((group, groupIndex) => (
                        <motion.section
                          key={group.dateKey}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: Math.min(groupIndex, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-energy-400">
                                <CalendarDays className="h-5 w-5" strokeWidth={2} />
                              </span>
                              <div>
                                <h3 className="font-display text-xl font-extrabold tracking-tight text-ink-900">{group.label}</h3>
                                <p className="text-xs font-medium text-ink-500">
                                  {group.workouts.length} {group.workouts.length === 1 ? 'workout' : 'workouts'}
                                </p>
                              </div>
                            </div>
                            <p className="chip border-energy-300/60 bg-energy-50 text-energy-800">
                              {group.totalVolume.toLocaleString()} kg total
                            </p>
                          </div>

                          <div className="space-y-4 border-l-2 border-ink-200 pl-6">
                            {group.workouts.map((workout, workoutIndex) => (
                              <motion.div
                                key={`${workout.name}-${workout.finishedAt}`}
                                whileHover={{ y: -2 }}
                                className="relative -ml-[31px] transition-shadow"
                              >
                                <span className="absolute -left-[9px] top-6 z-10 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-energy-400" />
                                <WorkoutRecordCard
                                  workout={workout}
                                  idPrefix={`${group.dateKey}-${workoutIndex}`}
                                  onDelete={handleDeleteWorkout}
                                  isDeleting={workout.id === deletingId}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.section>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
