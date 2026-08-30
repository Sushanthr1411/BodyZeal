import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import type { MonthVolume } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';

type MonthlyVolumeChartProps = {
  data: MonthVolume[];
};

/** Longer-horizon counterpart to the 7-day Volume Trend bars — a line, not
 * bars, so the two read as distinct at a glance (short-term detail vs
 * macro trend) even though both plot the same underlying metric. */
export default function MonthlyVolumeChart({ data }: MonthlyVolumeChartProps) {
  const hasData = data.some((d) => d.volume > 0);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <LineChartIcon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Monthly Volume</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">Last {data.length} months</p>
        </div>
      </div>

      {!hasData ? (
        <div className="mt-4">
          <EmptyState
            icon={LineChartIcon}
            title="Not enough history yet"
            description="Keep logging workouts and your month-over-month volume trend will build up here."
          />
        </div>
      ) : (
        <div className="mt-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E1D9C7" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                labelStyle={{ color: '#1D1811', fontWeight: 600, marginBottom: 2 }}
                formatter={(value) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#565FBE"
                strokeWidth={2}
                dot={{ r: 4, fill: '#565FBE', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
