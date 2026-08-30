import { ArrowDown, ArrowUp, Minus, ListChecks, PlayCircle, Weight } from 'lucide-react';
import type { WeekComparison } from '@/utils/analytics';
import AnimatedNumber from '@/components/common/AnimatedNumber';

type WeekComparisonRowProps = {
  data: WeekComparison;
};

type Delta = { direction: 'up' | 'down' | 'flat' | 'new'; percent: number };

function computeDelta(current: number, previous: number): Delta {
  if (previous === 0) return current > 0 ? { direction: 'new', percent: 0 } : { direction: 'flat', percent: 0 };
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent > 0) return { direction: 'up', percent };
  if (percent < 0) return { direction: 'down', percent: Math.abs(percent) };
  return { direction: 'flat', percent: 0 };
}

function DeltaBadge({ delta }: { delta: Delta }) {
  if (delta.direction === 'new') {
    return <span className="chip border-energy-300/60 bg-energy-50 text-[11px] text-energy-800">New this week</span>;
  }
  if (delta.direction === 'flat') {
    return (
      <span className="chip border-ink-200 bg-ink-50 text-[11px] text-ink-500">
        <Minus className="h-2.5 w-2.5" />
        Same as last week
      </span>
    );
  }
  const isUp = delta.direction === 'up';
  return (
    <span
      className={`chip text-[11px] ${isUp ? 'border-energy-300/60 bg-energy-50 text-energy-800' : 'border-coral-300/60 bg-coral-50 text-coral-700'}`}
    >
      {isUp ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {delta.percent}% vs last week
    </span>
  );
}

/** This week vs the prior calendar week — a momentum read, not a trend chart:
 * three numbers and a delta each is exactly what "am I doing more or less than
 * last week" needs, no plotting required. */
export default function WeekComparisonRow({ data }: WeekComparisonRowProps) {
  const { thisWeek, lastWeek } = data;
  const tiles = [
    {
      key: 'volume',
      label: 'Volume this week',
      value: thisWeek.volume,
      unit: 'kg',
      icon: Weight,
      tint: 'bg-violet-50/40 text-violet-600',
      delta: computeDelta(thisWeek.volume, lastWeek.volume),
    },
    {
      key: 'workouts',
      label: 'Workouts this week',
      value: thisWeek.workouts,
      unit: '',
      icon: PlayCircle,
      tint: 'bg-aqua-50/40 text-aqua-600',
      delta: computeDelta(thisWeek.workouts, lastWeek.workouts),
    },
    {
      key: 'sets',
      label: 'Sets this week',
      value: thisWeek.sets,
      unit: '',
      icon: ListChecks,
      tint: 'bg-coral-50/40 text-coral-600',
      delta: computeDelta(thisWeek.sets, lastWeek.sets),
    },
  ] as const;

  return (
    <div className="card flex flex-col divide-y divide-ink-200/70 overflow-hidden sm:flex-row sm:divide-x sm:divide-y-0">
      {tiles.map((tile) => (
        <div key={tile.key} className={`flex flex-1 items-center gap-4 p-5 ${tile.tint.split(' ')[0]}`}>
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white ${tile.tint.split(' ')[1]}`}>
            <tile.icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-500">{tile.label}</p>
            <p className="mt-0.5 font-display text-2xl font-extrabold tracking-tight text-ink-900">
              <AnimatedNumber value={tile.value} />
              {tile.unit && <span className="text-sm font-semibold text-ink-400"> {tile.unit}</span>}
            </p>
            <div className="mt-1.5">
              <DeltaBadge delta={tile.delta} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
