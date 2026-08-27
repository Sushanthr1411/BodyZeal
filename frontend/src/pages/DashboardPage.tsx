import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TodaySnapshot from '@/components/dashboard/TodaySnapshot';
import TodaysTrainingCard from '@/components/dashboard/TodaysTrainingCard';
import WorkoutEntryCard from '@/components/dashboard/WorkoutEntryCard';
import RestTimerCard from '@/components/dashboard/RestTimerCard';
import WorkoutHistoryCard from '@/components/dashboard/WorkoutHistoryCard';
import AnalyticsSection from '@/components/dashboard/analytics/AnalyticsSection';
import type { WorkoutSet } from '@/types/workout';
import { loadRecentWorkouts } from '@/lib/recentWorkouts';
import { loadActiveSession } from '@/lib/activeSession';
import { loadTodayLog, saveTodayLog } from '@/lib/todayLog';
import { isToday, todaysWorkouts } from '@/utils/analytics';
import { groupSetsByExercise } from '@/utils/workout';
import { useAuth } from '@/context/useAuth';
import { loadProfile } from '@/lib/profileStorage';

const sectionMotion = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
});

export default function DashboardPage() {
  const { user } = useAuth();
  // Quick-log entries from the "Log a Set" widget — persisted per-day so a reload doesn't wipe them.
  const [entries, setEntries] = useState<WorkoutSet[]>(() => loadTodayLog());
  const [history] = useState(() => loadRecentWorkouts());
  const [activeSession] = useState(() => loadActiveSession());
  const profile = user ? loadProfile(user.uid) : null;
  const firstName = (profile?.fullName || user?.displayName || '').split(' ')[0] || undefined;

  useEffect(() => {
    saveTodayLog(entries);
  }, [entries]);

  // "Today" should reflect ALL of today's training, not just the quick-log widget: finished
  // routine workouts from today, the in-progress routine session (if started today), and quick-log sets.
  const routineSetsToday = useMemo(() => {
    const fromFinished: WorkoutSet[] = todaysWorkouts(history).flatMap((workout, wi) =>
      (workout.sets ?? []).map((set, si) => ({
        id: `history-${wi}-${si}`,
        exerciseName: set.exerciseName,
        sets: 1,
        reps: set.reps,
        weight: set.weight,
        volume: set.volume,
        loggedAt: workout.finishedAt,
      })),
    );
    const fromActive = activeSession && isToday(new Date(activeSession.startedAt).toISOString())
      ? activeSession.entries
      : [];
    return [...fromFinished, ...fromActive];
  }, [history, activeSession]);

  const allTodaysSets = useMemo(
    () => [...routineSetsToday, ...entries].sort((a, b) => (a.loggedAt < b.loggedAt ? -1 : 1)),
    [routineSetsToday, entries],
  );
  const totalVolume = allTodaysSets.reduce((total, entry) => total + entry.volume, 0);
  const exerciseCount = useMemo(() => groupSetsByExercise(allTodaysSets).length, [allTodaysSets]);
  const removableIds = useMemo(() => new Set(entries.map((entry) => entry.id)), [entries]);

  function addEntry(entry: WorkoutSet) {
    setEntries((current) => [...current, entry]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <DashboardLayout>
      <DashboardHeader firstName={firstName} hasLoggedToday={allTodaysSets.length > 0} />
      <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          {/* Today's Training: only shown while a /workout routine session is actually in progress */}
          {activeSession && (
            <motion.div {...sectionMotion(0)}>
              <TodaysTrainingCard session={activeSession} />
            </motion.div>
          )}

          {/* Today, at a glance */}
          <motion.div {...sectionMotion(1)} className="mt-5">
            <TodaySnapshot exerciseCount={exerciseCount} totalVolume={totalVolume} />
          </motion.div>

          {/* Primary workspace: log a set + rest, side by side so both are reachable at once */}
          <motion.div {...sectionMotion(2)} className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
              Log a Set — quick, one-off entry
            </p>
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WorkoutEntryCard onAdd={addEntry} />
              </div>
              <RestTimerCard />
            </div>
          </motion.div>

          {/* Progress — brought up above Today's Activity so the graphs land sooner */}
          <motion.div {...sectionMotion(3)} className="mt-6">
            <AnalyticsSection history={history} />
          </motion.div>

          {/* Today's activity */}
          <motion.div {...sectionMotion(4)} className="mt-6">
            <WorkoutHistoryCard entries={allTodaysSets} onRemove={removeEntry} removableIds={removableIds} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
