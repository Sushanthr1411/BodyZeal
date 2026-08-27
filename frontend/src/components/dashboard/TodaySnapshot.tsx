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
      <div className="flex flex-1 items-center gap-4 bg-aqua-50/40 p-5 sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-aqua-50 text-aqua-600">
          <CalendarCheck className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-500">Exercises today</p>
          <p className="font-display text-4xl font-extrabold tracking-tight text-ink-900">
            <AnimatedNumber value={exerciseCount} />
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4 bg-violet-50/40 p-5 sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Calculator className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-500">Volume today</p>
          <p className="font-display text-4xl font-extrabold tracking-tight text-ink-900">
            <AnimatedNumber value={totalVolume} /> <span className="text-lg font-semibold text-ink-400">kg</span>
          </p>
        </div>
      </div>

      <div className={`flex flex-1 items-center gap-4 p-5 sm:p-6 ${hasActivity ? 'bg-energy-50/40' : ''}`}>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${hasActivity ? 'bg-energy-50 text-energy-600' : 'bg-ink-100 text-ink-400'}`}>
          <Flame className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-500">Status</p>
          <p className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            {hasActivity ? 'Logging in progress' : 'Nothing logged yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
