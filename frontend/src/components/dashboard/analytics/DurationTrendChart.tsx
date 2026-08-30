import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Timer } from 'lucide-react';
import type { SessionDuration } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';

type DurationTrendChartProps = {
  data: SessionDuration[];
};

/** How long recent sessions actually took — durationSeconds is recorded on every
 * finished workout but wasn't visualized anywhere before this. */
export default function DurationTrendChart({ data }: DurationTrendChartProps) {
  const avgMinutes = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.minutes, 0) / data.length) : 0;

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aqua-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aqua-50 text-aqua-600">
            <Timer className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Session Length</p>
            <p className="mt-0.5 truncate text-xs text-ink-500">Last {data.length || 0} tracked workouts</p>
          </div>
        </div>
        {data.length > 0 && (
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-700 text-ink-900">{avgMinutes}</p>
            <p className="text-[11px] text-ink-500">avg minutes</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Timer}
            title="No timed sessions yet"
            description="Sessions started from the Log Workout page track their length here once finished."
          />
        </div>
      ) : (
        <div className="mt-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap={12}>
              <CartesianGrid vertical={false} stroke="#E1D9C7" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} />
              <Tooltip
                cursor={{ fill: '#F0EBDF' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                labelStyle={{ color: '#1D1811', fontWeight: 600, marginBottom: 2 }}
                formatter={(value) => [`${Number(value)} min`, 'Duration']}
              />
              <Bar dataKey="minutes" fill="#28937A" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
