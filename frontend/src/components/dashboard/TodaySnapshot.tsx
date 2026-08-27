import { CalendarCheck, Calculator, Flame } from 'lucide-react';
import AnimatedNumber from '@/components/common/AnimatedNumber';

type TodaySnapshotProps = {
  exerciseCount: number;
  totalVolume: number;
};

/**
 * A single, scannable "today" strip instead of two large stat cards —
 * both numbers read together in one glance.
 */
export default function TodaySnapshot({ exerciseCount, totalVolume }: TodaySnapshotProps) {
  const hasActivity = exerciseCount > 0;

  return (
    <div className="card flex flex-col divide-y divide-ink-200/70 overflow-hidden sm:flex-row sm:divide-x sm:divide-y-0">
      <div className="flex flex-1 items-center gap-3 bg-aqua-50/40 p-4 sm:p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-aqua-50 text-aqua-600">
          <CalendarCheck className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-ink-500">Exercises today</p>
          <p className="font-display text-2xl font-semibold text-ink-900">
            <AnimatedNumber value={exerciseCount} />
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3 bg-violet-50/40 p-4 sm:p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
          <Calculator className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-ink-500">Volume today</p>
          <p className="font-display text-2xl font-semibold text-ink-900">
            <AnimatedNumber value={totalVolume} /> <span className="text-sm font-medium text-ink-400">kg</span>
          </p>
        </div>
      </div>

      <div className={`flex flex-1 items-center gap-3 p-4 sm:p-5 ${hasActivity ? 'bg-energy-50/40' : ''}`}>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${hasActivity ? 'bg-energy-50 text-energy-600' : 'bg-ink-100 text-ink-400'}`}>
          <Flame className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-ink-500">Status</p>
          <p className="text-base font-semibold text-ink-900">
            {hasActivity ? 'Logging in progress' : 'Nothing logged yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
