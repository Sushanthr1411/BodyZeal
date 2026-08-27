import { BarChart3 } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { frequencyGrid, muscleGroupBreakdown, volumeByDay } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';
import VolumeTrendChart from '@/components/dashboard/analytics/VolumeTrendChart';
import MuscleGroupChart from '@/components/dashboard/analytics/MuscleGroupChart';
import FrequencyHeatmap from '@/components/dashboard/analytics/FrequencyHeatmap';
import ExerciseProgressChart from '@/components/dashboard/analytics/ExerciseProgressChart';

type AnalyticsSectionProps = {
  history: RecentWorkout[];
};

export default function AnalyticsSection({ history }: AnalyticsSectionProps) {
  if (history.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <BarChart3 className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Progress</p>
            <p className="truncate text-xs text-ink-500">Trends across your finished workouts</p>
          </div>
        </div>
        <div className="mt-4">
          <EmptyState
            icon={BarChart3}
            title="No progress yet"
            description="Finish a workout on the Log Workout page and your volume trend, muscle group split, frequency, and personal records will appear here."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <BarChart3 className="h-4 w-4 text-ink-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Progress</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VolumeTrendChart data={volumeByDay(history, 7)} />
        <MuscleGroupChart data={muscleGroupBreakdown(history)} />
      </div>

      <FrequencyHeatmap data={frequencyGrid(history, 20)} />

      <ExerciseProgressChart history={history} />
    </div>
  );
}
