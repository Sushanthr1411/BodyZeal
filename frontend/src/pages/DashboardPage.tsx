import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCard from '@/components/dashboard/SummaryCard';
import WorkoutEntryCard from '@/components/dashboard/WorkoutEntryCard';
import VolumeCard from '@/components/dashboard/VolumeCard';
import RestTimerCard from '@/components/dashboard/RestTimerCard';
import WorkoutHistoryCard from '@/components/dashboard/WorkoutHistoryCard';
import type { WorkoutSet } from '@/types/workout';

export default function DashboardPage() {
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
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
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WorkoutEntryCard onAdd={addEntry} />
            </div>
            <RestTimerCard />
          </div>

          {/* Secondary row: quick stats */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SummaryCard exerciseCount={entries.length} />
            <VolumeCard totalVolume={totalVolume} />
          </div>

          {/* History */}
          <div className="mt-4">
            <WorkoutHistoryCard entries={entries} onRemove={removeEntry} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
