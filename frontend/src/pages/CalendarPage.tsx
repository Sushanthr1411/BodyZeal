import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Dumbbell, Flame, ListChecks } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import WorkoutRecordCard from '@/components/history/WorkoutRecordCard';
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import { dateKey } from '@/utils/analytics';
import { formatTime } from '@/utils/workout';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function intensityColor(count: number): string {
  if (count <= 0) return 'transparent';
  if (count === 1) return '#D3E68C';
  if (count === 2) return '#9FC232';
  return '#526615';
}

export default function CalendarPage() {
  const [history, setHistory] = useState<RecentWorkout[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadRecentWorkouts().then((loaded) => {
      if (!cancelled) setHistory(loaded);
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
  const selectedLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const dayVolume = selectedWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const daySets = selectedWorkouts.reduce((sum, w) => sum + (w.totalSets ?? w.sets?.length ?? 0), 0);
  const dayDuration = selectedWorkouts.reduce((sum, w) => sum + (w.durationSeconds ?? 0), 0);

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        description="Pick any day to see exactly what you logged and how it went."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Month grid */}
          <div className="card p-5 lg:col-span-3">
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

            <div className="mt-4 grid grid-cols-7 gap-1.5">
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
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-ink-900 text-white'
                        : isToday
                          ? 'bg-energy-50 text-ink-900 ring-1 ring-inset ring-energy-300'
                          : 'text-ink-700 hover:bg-ink-100'
                    }`}
                  >
                    {day}
                    {count > 0 && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: isSelected ? '#9FC232' : intensityColor(count) }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="space-y-4 lg:col-span-2">
            <div className="card p-5">
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
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-energy-50/60 px-2.5 py-2.5 text-center">
                    <ListChecks className="mx-auto h-3.5 w-3.5 text-energy-600" />
                    <p className="mt-1 font-display text-base font-extrabold text-ink-900">{daySets}</p>
                    <p className="text-[10px] text-ink-500">sets</p>
                  </div>
                  <div className="rounded-xl bg-violet-50/60 px-2.5 py-2.5 text-center">
                    <Flame className="mx-auto h-3.5 w-3.5 text-violet-600" />
                    <p className="mt-1 font-display text-base font-extrabold text-ink-900">{dayVolume.toLocaleString()}</p>
                    <p className="text-[10px] text-ink-500">kg volume</p>
                  </div>
                  <div className="rounded-xl bg-sky-50/60 px-2.5 py-2.5 text-center">
                    <Clock className="mx-auto h-3.5 w-3.5 text-sky-600" />
                    <p className="mt-1 font-display text-base font-extrabold text-ink-900">{dayDuration > 0 ? formatTime(dayDuration) : '—'}</p>
                    <p className="text-[10px] text-ink-500">duration</p>
                  </div>
                </div>
              )}
            </div>

            {selectedWorkouts.length === 0 ? (
              <div className="card p-6">
                <EmptyState
                  icon={Dumbbell}
                  title="No workouts logged"
                  description="Nothing was finished on this day."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {selectedWorkouts.map((workout, index) => (
                  <motion.div
                    key={`${workout.name}-${workout.finishedAt}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <WorkoutRecordCard workout={workout} idPrefix={`${selectedKey}-${index}`} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
