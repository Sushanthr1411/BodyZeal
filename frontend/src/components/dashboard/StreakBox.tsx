import { Flame } from 'lucide-react';

export default function StreakBox({ streak }: { streak: number }) {
  const active = streak > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-energy-400 text-ink-950' : 'bg-white/10 text-ink-400'}`}>
          <Flame className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-300">Streak</p>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-white">
        {streak} <span className="text-sm font-medium text-ink-400">{streak === 1 ? 'day' : 'days'}</span>
      </p>
      <p className="mt-0.5 text-xs text-ink-400">
        {active ? 'Keep it up!' : 'Log a workout to start one'}
      </p>
    </div>
  );
}
