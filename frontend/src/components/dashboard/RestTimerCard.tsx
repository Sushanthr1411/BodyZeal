import { Timer, Play } from 'lucide-react';

export default function RestTimerCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
          <Timer className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">Rest Timer</p>
          <p className="text-xs text-ink-500">Countdown between sets</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative grid h-28 w-28 place-items-center rounded-full border-4 border-ink-100">
          <div className="text-center">
            <p className="font-display text-3xl font-700 tabular-nums text-ink-900">00:00</p>
          </div>
        </div>
        <button
          disabled
          className="btn mt-5 w-full cursor-not-allowed bg-ink-100 text-ink-400"
        >
          <Play className="h-4 w-4" />
          Start rest timer
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-400">
        Timer controls arrive in the next stage.
      </p>
    </div>
  );
}
