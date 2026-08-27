import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Flame, History, ListChecks, Weight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import WorkoutRecordCard from '@/components/history/WorkoutRecordCard';
import { loadRecentWorkouts } from '@/lib/recentWorkouts';
import { currentStreak, groupWorkoutsByDate } from '@/utils/analytics';

export default function HistoryPage() {
  const [history] = useState(() => loadRecentWorkouts());
  const groups = groupWorkoutsByDate(history);

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((total, workout) => total + workout.totalVolume, 0);
  const streak = currentStreak(history);

  return (
    <DashboardLayout>
      <PageHeader
        title="History"
        description="Every finished workout, grouped by date and sorted chronologically."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl">
          {groups.length === 0 ? (
            <div className="card p-5">
              <EmptyState
                icon={History}
                title="No workout history yet"
                description="Finish a workout on the Log Workout page and it will appear here grouped by date, with every exercise and set you logged."
              />
            </div>
          ) : (
            <>
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
                      <AnimatedNumber value={streak} /> <span className="text-base font-semibold text-ink-400">{streak === 1 ? 'day' : 'days'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-10">
                {groups.map((group, groupIndex) => (
                  <motion.section
                    key={group.dateKey}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: groupIndex * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-energy-400">
                          <CalendarDays className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-900">{group.label}</h2>
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
                          <WorkoutRecordCard workout={workout} idPrefix={`${group.dateKey}-${workoutIndex}`} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
