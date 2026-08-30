import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import type { RepRangeSlice } from '@/utils/analytics';
import { CATEGORICAL_COLORS } from '@/utils/chartPalette';
import EmptyState from '@/components/common/EmptyState';

type RepRangeChartProps = {
  data: RepRangeSlice[];
};

// Fixed category -> color mapping (not rank-based like the sorted breakdowns
// elsewhere) — these three categories never reorder, so color follows the
// entity by construction: Strength is always the same hue.
const CATEGORY_COLOR: Record<string, string> = {
  Strength: CATEGORICAL_COLORS[0],
  Hypertrophy: CATEGORICAL_COLORS[1],
  Endurance: CATEGORICAL_COLORS[2],
};

/** How your volume splits across rep ranges — a training-style lens (heavy/low-rep
 * vs moderate vs high-rep/endurance work) that nothing else on the dashboard shows. */
export default function RepRangeChart({ data }: RepRangeChartProps) {
  const total = data.reduce((sum, d) => sum + d.volume, 0);
  const hasData = total > 0;

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-coral-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-coral-50 text-coral-600">
          <Target className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Training Style</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">Volume by rep range, all-time</p>
        </div>
      </div>

      {!hasData ? (
        <div className="mt-4">
          <EmptyState
            icon={Target}
            title="No sets logged yet"
            description="Log a few sets and your split across strength, hypertrophy, and endurance rep ranges will show up here."
          />
        </div>
      ) : (
        <div className="relative mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="volume" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={2} stroke="#FFFFFF">
                  {data.map((slice) => (
                    <Cell key={slice.label} fill={CATEGORY_COLOR[slice.label]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                  labelStyle={{ color: '#1D1811', fontWeight: 600 }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} kg`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-lg font-extrabold leading-none text-ink-900">{total.toLocaleString()}</p>
                <p className="text-[10px] text-ink-400">kg total</p>
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-2.5">
            {data.map((slice) => (
              <div key={slice.label} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[slice.label] }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink-700">{slice.label}</span>
                  <span className="block truncate text-[10px] text-ink-400">{slice.range}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink-600">{slice.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
