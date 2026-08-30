import { Layers } from 'lucide-react';
import type { EquipmentSlice } from '@/utils/analytics';
import { CATEGORICAL_COLORS } from '@/utils/chartPalette';
import EmptyState from '@/components/common/EmptyState';

type EquipmentChartProps = {
  data: EquipmentSlice[];
};

/** Volume by equipment type — free weights vs machines vs bodyweight — a
 * different cut than muscle group, using the same exercise metadata. */
export default function EquipmentChart({ data }: EquipmentChartProps) {
  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aqua-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aqua-50 text-aqua-600">
          <Layers className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Equipment Split</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">Volume by equipment, all-time</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Layers}
            title="No breakdown yet"
            description="Finish a few workouts to see how your training splits across equipment types."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.map((entry, index) => {
            const color = CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
            const widthPercent = Math.max(4, (entry.volume / maxVolume) * 100);
            return (
              <div key={entry.equipment} className="flex items-center gap-3">
                <span className="w-[110px] shrink-0 truncate text-xs font-medium text-ink-700">{entry.equipment}</span>
                <div className="flex-1 rounded-full bg-ink-50">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{ width: `${widthPercent}%`, background: color }}
                    title={`${entry.equipment}: ${entry.volume.toLocaleString()} kg (${entry.percent}%)`}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-600">{entry.percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
