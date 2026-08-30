import { Dumbbell } from 'lucide-react';
import type { TopExercise } from '@/utils/analytics';
import { CATEGORICAL_COLORS } from '@/utils/chartPalette';
import EmptyState from '@/components/common/EmptyState';

type TopExercisesChartProps = {
  data: TopExercise[];
};

/** Ranks exercises by total volume — finer-grained than the muscle-group split:
 * two lifters training the same muscle group can still be doing very different
 * exercises, and this is the only place that distinction shows up. */
export default function TopExercisesChart({ data }: TopExercisesChartProps) {
  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
          <Dumbbell className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Top Exercises</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">By volume, all-time</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Dumbbell}
            title="No exercises yet"
            description="Finish a few workouts to see which exercises make up most of your volume."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.map((entry, index) => {
            const color = CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
            const widthPercent = Math.max(4, (entry.volume / maxVolume) * 100);
            return (
              <div key={entry.exerciseName} className="flex items-center gap-3">
                <span className="w-[110px] shrink-0 truncate text-xs font-medium text-ink-700">
                  {entry.exerciseName}
                </span>
                <div className="flex-1 rounded-full bg-ink-50">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{ width: `${widthPercent}%`, background: color }}
                    title={`${entry.exerciseName}: ${entry.volume.toLocaleString()} kg (${entry.percent}%)`}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-ink-600">
                  {entry.volume.toLocaleString()} kg
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
