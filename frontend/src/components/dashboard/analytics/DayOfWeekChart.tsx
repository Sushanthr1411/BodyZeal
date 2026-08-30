import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Activity } from 'lucide-react';
import type { WeekdayCount } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';

type DayOfWeekChartProps = {
  data: WeekdayCount[];
};

/** Which weekdays you actually train on, all-time — a weekly-rhythm view distinct
 * from the frequency heatmap's chronological calendar (that shows *when* across
 * real dates; this collapses it to *which day of the week*, most-favored included). */
export default function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const hasData = data.some((d) => d.count > 0);
  const busiest = data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-energy-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-energy-50 text-energy-600">
            <Activity className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Training Days</p>
            <p className="mt-0.5 truncate text-xs text-ink-500">Workouts by weekday, all-time</p>
          </div>
        </div>
        {hasData && busiest.count > 0 && (
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-700 text-ink-900">{busiest.day}</p>
            <p className="text-[11px] text-ink-500">most active day</p>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="mt-4">
          <EmptyState
            icon={Activity}
            title="No pattern yet"
            description="Finish a few workouts across different days and your weekly training rhythm will show up here."
          />
        </div>
      ) : (
        <div className="mt-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap={12}>
              <CartesianGrid vertical={false} stroke="#E1D9C7" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} />
              <Tooltip
                cursor={{ fill: '#F0EBDF' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                labelStyle={{ color: '#1D1811', fontWeight: 600, marginBottom: 2 }}
                formatter={(value) => [`${Number(value)} ${Number(value) === 1 ? 'workout' : 'workouts'}`, '']}
              />
              <Bar dataKey="count" fill="#9FC232" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
