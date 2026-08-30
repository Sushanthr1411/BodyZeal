import { BarChart3 } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import {
  equipmentBreakdown,
  frequencyGrid,
  muscleGroupBreakdown,
  recentSessionDurations,
  repRangeDistribution,
  topExercisesByVolume,
  volumeByDay,
  volumeByMonth,
  weekOverWeekStats,
  workoutsByDayOfWeek,
} from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';
import WeekComparisonRow from '@/components/dashboard/analytics/WeekComparisonRow';
import VolumeTrendChart from '@/components/dashboard/analytics/VolumeTrendChart';
import MonthlyVolumeChart from '@/components/dashboard/analytics/MonthlyVolumeChart';
import MuscleGroupChart from '@/components/dashboard/analytics/MuscleGroupChart';
import TopExercisesChart from '@/components/dashboard/analytics/TopExercisesChart';
import RepRangeChart from '@/components/dashboard/analytics/RepRangeChart';
import DurationTrendChart from '@/components/dashboard/analytics/DurationTrendChart';
import DayOfWeekChart from '@/components/dashboard/analytics/DayOfWeekChart';
import EquipmentChart from '@/components/dashboard/analytics/EquipmentChart';
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
            <p className="mt-0.5 truncate text-xs text-ink-500">Trends across your finished workouts</p>
          </div>
        </div>
        <div className="mt-4">
          <EmptyState
            icon={BarChart3}
            title="No progress yet"
            description="Finish a workout on the Log Workout page and your weekly momentum, volume trends, muscle group split, top exercises, training style, session length, weekday pattern, frequency, and personal records will appear here."
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

      <WeekComparisonRow data={weekOverWeekStats(history)} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MuscleGroupChart data={muscleGroupBreakdown(history)} />
        <RepRangeChart data={repRangeDistribution(history)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VolumeTrendChart data={volumeByDay(history, 7)} />
        <MonthlyVolumeChart data={volumeByMonth(history, 6)} />
        <TopExercisesChart data={topExercisesByVolume(history, 6)} />
        <DurationTrendChart data={recentSessionDurations(history, 10)} />
        <DayOfWeekChart data={workoutsByDayOfWeek(history)} />
        <EquipmentChart data={equipmentBreakdown(history)} />
      </div>

      <FrequencyHeatmap data={frequencyGrid(history, 20)} />

      <ExerciseProgressChart history={history} />
    </div>
  );
}
