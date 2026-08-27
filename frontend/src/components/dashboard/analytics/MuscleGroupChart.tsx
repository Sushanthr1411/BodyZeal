import { PieChart as PieChartIcon } from 'lucide-react';
import type { MuscleGroupSlice } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';

// Validated categorical palette (dataviz skill) — fixed order, never cycled.
const CATEGORY_COLORS = ['#565FBE', '#C96936', '#28937A', '#8F4F7E', '#C9971E', '#B4577B'];
const OTHER_COLOR = '#C7BC9F';

type MuscleGroupChartProps = {
  data: MuscleGroupSlice[];
};

export default function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  const chartData = data.slice().sort((a, b) => b.volume - a.volume);
  const maxVolume = Math.max(...chartData.map((d) => d.volume), 1);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <PieChartIcon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Muscle Group Split</p>
          <p className="truncate text-xs text-ink-500">Volume by muscle group, all-time</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={PieChartIcon}
            title="No breakdown yet"
            description="Finish a few workouts to see how your training splits across muscle groups."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {chartData.map((slice, index) => {
            const color = slice.muscleGroup === 'Other' ? OTHER_COLOR : CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            const widthPercent = Math.max(4, (slice.volume / maxVolume) * 100);
            return (
              <div key={slice.muscleGroup} className="flex items-center gap-3">
                <span className="w-[74px] shrink-0 truncate text-xs font-medium text-ink-700">
                  {slice.muscleGroup}
                </span>
                <div className="flex-1 rounded-full bg-ink-50">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{ width: `${widthPercent}%`, background: color }}
                    title={`${slice.muscleGroup}: ${slice.volume.toLocaleString()} kg (${slice.percent}%)`}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-600">
                  {slice.percent}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
