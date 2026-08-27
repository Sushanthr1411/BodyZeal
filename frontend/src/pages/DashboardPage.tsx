import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCard from '@/components/dashboard/SummaryCard';
import WorkoutEntryCard from '@/components/dashboard/WorkoutEntryCard';
import VolumeCard from '@/components/dashboard/VolumeCard';
import RestTimerCard from '@/components/dashboard/RestTimerCard';
import WorkoutHistoryCard from '@/components/dashboard/WorkoutHistoryCard';
import AnalyticsSection from '@/components/dashboard/analytics/AnalyticsSection';
import type { WorkoutSet } from '@/types/workout';
import { loadRecentWorkouts } from '@/lib/recentWorkouts';

const sectionMotion = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as const },
});

export default function DashboardPage() {
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [history] = useState(() => loadRecentWorkouts());
  const totalVolume = entries.reduce((total, entry) => total + entry.volume, 0);

  function addEntry(entry: WorkoutSet) {
    setEntries((current) => [...current, entry]);
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Primary row: log a set (hero) + rest timer */}
          <motion.div {...sectionMotion(0)} className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WorkoutEntryCard onAdd={addEntry} />
            </div>
            <RestTimerCard />
          </motion.div>

          {/* Secondary row: quick stats */}
          <motion.div {...sectionMotion(1)} className="mt-4 grid gap-4 sm:grid-cols-2">
            <SummaryCard exerciseCount={entries.length} />
            <VolumeCard totalVolume={totalVolume} />
          </motion.div>

          {/* Today's activity */}
          <motion.div {...sectionMotion(2)} className="mt-4">
            <WorkoutHistoryCard entries={entries} onRemove={removeEntry} />
          </motion.div>

          {/* Analytics — trends from finished workouts */}
          <motion.div {...sectionMotion(3)} className="mt-6">
            <AnalyticsSection history={history} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
