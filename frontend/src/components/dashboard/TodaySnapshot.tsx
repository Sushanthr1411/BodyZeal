import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Calculator, Trophy } from 'lucide-react';
import AnimatedNumber from '@/components/common/AnimatedNumber';

function formatPRExerciseList(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} & ${names.length - 2} more`;
}

type TodaySnapshotProps = {
  exerciseCount: number;
  totalVolume: number;
  /** Names of exercises where today's heaviest set beat your best from every prior day. */
  newPRExercises: string[];
};

/**
 * A single, scannable "today" strip instead of two large stat cards —
 * both numbers read together in one glance.
 */
export default function TodaySnapshot({ exerciseCount, totalVolume, newPRExercises }: TodaySnapshotProps) {
  const hasActivity = exerciseCount > 0;
  const hasPR = newPRExercises.length > 0;

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

      <Link
        to="/personal-records"
        className={`group flex flex-1 items-center gap-4 p-5 transition-colors sm:p-6 ${hasPR ? 'bg-energy-50/40 hover:bg-energy-50' : 'hover:bg-ink-50'}`}
        title="A PR (personal record) here means today's heaviest set on an exercise beat your best weight ever on that exercise, on any earlier day. Click to explore all your records."
      >
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${hasPR ? 'bg-energy-50 text-energy-600' : 'bg-ink-100 text-ink-400'}`}>
          <Trophy className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink-500">New PRs today</p>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-ink-400 group-hover:text-ink-700">
              Explore
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          {hasActivity ? (
            <>
              <p className="font-display text-4xl font-extrabold tracking-tight text-ink-900">
                <AnimatedNumber value={newPRExercises.length} />
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-500">
                {hasPR
                  ? `Heaviest ever on: ${formatPRExerciseList(newPRExercises)}`
                  : "Today's sets, none heavier than before"}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-extrabold tracking-tight text-ink-400">—</p>
              <p className="mt-0.5 text-xs text-ink-400">Log a set to see if it's a new best</p>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
