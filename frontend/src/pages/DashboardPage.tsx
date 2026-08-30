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
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import { loadActiveSession, type ActiveSessionSnapshot } from '@/lib/activeSession';
import { loadTodayLog, addTodayLogEntry } from '@/lib/todayLog';
import { isToday, todaysPersonalRecordExercises, todaysWorkouts } from '@/utils/analytics';
import { groupSetsByExercise } from '@/utils/workout';
import { useAuth } from '@/context/useAuth';
import { loadProfile } from '@/lib/profileStorage';
import type { UserProfile } from '@/types/profile';

const sectionMotion = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
});

export default function DashboardPage() {
  const { user } = useAuth();
  // Quick-log entries from the "Log a Set" widget — persisted per-day so a reload doesn't wipe them.
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [quickLogError, setQuickLogError] = useState('');
  const [history, setHistory] = useState<RecentWorkout[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadTodayLog().then((loaded) => {
      if (!cancelled) setEntries(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [activeSession, setActiveSession] = useState<ActiveSessionSnapshot | null>(null);
  useEffect(() => {
    loadActiveSession().then(setActiveSession);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // The default limit (60) was fine for the old 7-day/20-week charts, but the
    // Progress section now also plots a 6-month trend and several all-time
    // breakdowns — the backend's max (200) keeps those from silently truncating
    // an active user's older history.
    loadRecentWorkouts(200).then((loaded) => {
      if (!cancelled) setHistory(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const firstName = (profile?.fullName || user?.displayName || '').split(' ')[0] || undefined;
  const reportUserName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Athlete';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadProfile(user.uid).then((loaded) => {
      if (!cancelled) setProfile(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // "Today" should reflect ALL of today's training, not just the quick-log widget: finished
  // routine workouts from today, the in-progress routine session (if started today), and quick-log sets.
  // `history` now also carries today's quick logs (merged into /api/workouts for Exercise History) —
  // excluded here since `entries` below (the dedicated, optimistically-updated /api/workouts/today
  // fetch) is already the source of truth for them; without this filter they'd be double-counted.
  const routineSetsToday = useMemo(() => {
    const fromFinished: WorkoutSet[] = todaysWorkouts(history)
      .filter((workout) => workout.kind !== 'quickLog')
      .flatMap((workout, wi) =>
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
  const newPRExercises = useMemo(() => todaysPersonalRecordExercises(history, allTodaysSets), [history, allTodaysSets]);

  function addEntry(entry: WorkoutSet & { exerciseId: string }) {
    setQuickLogError('');
    setEntries((current) => [...current, entry]); // optimistic
    addTodayLogEntry({ exerciseId: entry.exerciseId, sets: entry.sets, reps: entry.reps, weight: entry.weight })
      .then((saved) => {
        setEntries((current) => current.map((e) => (e.id === entry.id ? saved : e)));
      })
      .catch(() => {
        setEntries((current) => current.filter((e) => e.id !== entry.id)); // rollback
        setQuickLogError("Couldn't save that set — try again.");
      });
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        firstName={firstName}
        hasLoggedToday={allTodaysSets.length > 0}
        history={history}
        reportUserName={reportUserName}
        reportUserEmail={user?.email ?? undefined}
      />
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
            <TodaySnapshot exerciseCount={exerciseCount} totalVolume={totalVolume} newPRExercises={newPRExercises} />
          </motion.div>

          {/* Primary workspace: log a set + rest, side by side so both are reachable at once */}
          <motion.div {...sectionMotion(2)} className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
              Log a Set — quick, one-off entry
            </p>
            {quickLogError && (
              <p role="alert" className="mb-2 text-sm font-medium text-red-600">{quickLogError}</p>
            )}
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
            <WorkoutHistoryCard entries={allTodaysSets} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
