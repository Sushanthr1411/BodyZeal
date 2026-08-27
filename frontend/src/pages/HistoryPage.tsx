import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Dumbbell, History } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { loadRecentWorkouts } from '@/lib/recentWorkouts';
import { groupWorkoutsByDate } from '@/utils/analytics';
import { groupSetsByExercise } from '@/utils/workout';

export default function HistoryPage() {
  const [history] = useState(() => loadRecentWorkouts());
  const groups = groupWorkoutsByDate(history);

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
            <div className="space-y-8">
              {groups.map((group, groupIndex) => (
                <motion.section
                  key={group.dateKey}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-energy-400">
                        <CalendarDays className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <h2 className="font-display text-lg font-semibold text-ink-900">{group.label}</h2>
                    </div>
                    <p className="text-xs font-medium text-ink-500">
                      {group.totalVolume.toLocaleString()} kg total
                    </p>
                  </div>

                  <div className="space-y-3 border-l-2 border-ink-200 pl-5">
                    {group.workouts.map((workout, workoutIndex) => {
                      const grouped = groupSetsByExercise(
                        (workout.sets ?? []).map((set, index) => ({
                          id: `${group.dateKey}-${workoutIndex}-${index}`,
                          exerciseName: set.exerciseName,
                          sets: 1,
                          reps: set.reps,
                          weight: set.weight,
                          volume: set.volume,
                          loggedAt: workout.finishedAt,
                        })),
                      );
                      return (
                        <div key={`${workout.name}-${workout.finishedAt}`} className="card relative -ml-[27px] p-5">
                          <span className="absolute -left-[7px] top-6 h-3 w-3 rounded-full border-2 border-white bg-energy-400" />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-ink-900">{workout.name}</p>
                            <div className="flex items-center gap-3 text-xs text-ink-500">
                              <span>{new Date(workout.finishedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                              <span>{workout.totalSets ?? workout.sets?.length ?? 0} sets</span>
                              <span className="font-semibold text-ink-800">{workout.totalVolume.toLocaleString()} kg</span>
                            </div>
                          </div>

                          {grouped.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {grouped.map((exercise) => (
                                <div key={exercise.exerciseName} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2">
                                  <span className="flex min-w-0 items-center gap-2">
                                    <Dumbbell className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                                    <span className="truncate text-sm font-medium text-ink-800">{exercise.exerciseName}</span>
                                  </span>
                                  <span className="shrink-0 text-xs text-ink-500">
                                    {exercise.sets.length} × {exercise.sets[0]?.reps ?? 0} reps · {exercise.volume.toLocaleString()} kg
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
