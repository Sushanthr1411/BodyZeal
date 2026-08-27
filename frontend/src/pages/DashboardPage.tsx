import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCard from '@/components/dashboard/SummaryCard';
import WorkoutEntryCard from '@/components/dashboard/WorkoutEntryCard';
import VolumeCard from '@/components/dashboard/VolumeCard';
import RestTimerCard from '@/components/dashboard/RestTimerCard';
import WorkoutHistoryCard from '@/components/dashboard/WorkoutHistoryCard';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Top row: summary + volume */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard />
            <VolumeCard />
            <div className="lg:col-span-2">
              <RestTimerCard />
            </div>
          </div>

          {/* Main grid: entry + history */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <WorkoutEntryCard />
            <WorkoutHistoryCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
