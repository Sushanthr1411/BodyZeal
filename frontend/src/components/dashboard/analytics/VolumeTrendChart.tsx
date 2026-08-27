import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { DayVolume } from '@/utils/analytics';

type VolumeTrendChartProps = {
  data: DayVolume[];
};

export default function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  const total = data.reduce((sum, d) => sum + d.volume, 0);
  const hasData = total > 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-50 text-energy-600">
            <TrendingUp className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Volume Trend</p>
            <p className="text-xs text-ink-500">Last 7 days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-700 text-ink-900">{total.toLocaleString()}</p>
          <p className="text-[11px] text-ink-500">kg this week</p>
        </div>
      </div>

      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap={12}>
            <CartesianGrid vertical={false} stroke="#E9EBEE" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#828A96' }}
            />
            <Tooltip
              cursor={{ fill: '#F5F6F7' }}
              contentStyle={{ borderRadius: 10, border: '1px solid #E9EBEE', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(16,18,21,0.18)' }}
              labelStyle={{ color: '#16181D', fontWeight: 600, marginBottom: 2 }}
              formatter={(value) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
            />
            <Bar dataKey="volume" fill="#84CC16" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!hasData && (
        <p className="mt-2 text-center text-xs text-ink-400">
          Finish a workout to start seeing your volume trend here.
        </p>
      )}
    </div>
  );
}
