import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { MuscleGroupSlice } from '@/utils/analytics';
import { CATEGORICAL_COLORS, CATEGORICAL_OTHER_COLOR } from '@/utils/chartPalette';
import EmptyState from '@/components/common/EmptyState';

type MuscleGroupChartProps = {
  data: MuscleGroupSlice[];
};

export default function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  const chartData = data.slice().sort((a, b) => b.volume - a.volume);
  const total = chartData.reduce((sum, d) => sum + d.volume, 0);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <PieChartIcon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Muscle Group Split</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">Volume by muscle group, all-time</p>
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
        <div className="relative mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="volume"
                  nameKey="muscleGroup"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={chartData.length > 1 ? 2 : 0}
                  strokeWidth={2}
                  stroke="#FFFFFF"
                >
                  {chartData.map((slice, index) => (
                    <Cell
                      key={slice.muscleGroup}
                      fill={slice.muscleGroup === 'Other' ? CATEGORICAL_OTHER_COLOR : CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]}
                    />
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

          <div className="w-full min-w-0 flex-1 space-y-2">
            {chartData.map((slice, index) => {
              const color = slice.muscleGroup === 'Other' ? CATEGORICAL_OTHER_COLOR : CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
              return (
                <div key={slice.muscleGroup} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink-700">{slice.muscleGroup}</span>
                  <span className="shrink-0 font-semibold text-ink-600">{slice.percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
