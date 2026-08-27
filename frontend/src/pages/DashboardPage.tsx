import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TodaySnapshot from '@/components/dashboard/TodaySnapshot';
import WorkoutEntryCard from '@/components/dashboard/WorkoutEntryCard';
import RestTimerCard from '@/components/dashboard/RestTimerCard';
import WorkoutHistoryCard from '@/components/dashboard/WorkoutHistoryCard';
import AnalyticsSection from '@/components/dashboard/analytics/AnalyticsSection';
import type { WorkoutSet } from '@/types/workout';
import { loadRecentWorkouts } from '@/lib/recentWorkouts';
import { useAuth } from '@/context/useAuth';
import { loadProfile } from '@/lib/profileStorage';

const sectionMotion = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [history] = useState(() => loadRecentWorkouts());
  const totalVolume = entries.reduce((total, entry) => total + entry.volume, 0);
  const profile = user ? loadProfile(user.uid) : null;
  const firstName = (profile?.fullName || user?.displayName || '').split(' ')[0] || undefined;

  function addEntry(entry: WorkoutSet) {
    setEntries((current) => [...current, entry]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <DashboardLayout>
      <DashboardHeader firstName={firstName} hasLoggedToday={entries.length > 0} />
      <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          {/* Today, at a glance */}
          <motion.div {...sectionMotion(0)}>
            <TodaySnapshot exerciseCount={entries.length} totalVolume={totalVolume} />
          </motion.div>

          {/* Primary workspace: log a set + rest, side by side so both are reachable at once */}
          <motion.div {...sectionMotion(1)} className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
              Log Workout
            </p>
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WorkoutEntryCard onAdd={addEntry} />
              </div>
              <RestTimerCard />
            </div>
          </motion.div>

          {/* Today's activity — close to the entry flow, not buried below analytics */}
          <motion.div {...sectionMotion(2)} className="mt-5">
            <WorkoutHistoryCard entries={entries} onRemove={removeEntry} />
          </motion.div>

          {/* Progress — cohesive analytics section */}
          <motion.div {...sectionMotion(3)} className="mt-6">
            <AnalyticsSection history={history} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
