import { useEffect, useState } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { formatTime } from '@/utils/workout';

export default function RestTimerCard() {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) { setRunning(false); return 0; }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [running]);
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
            <p className="font-display text-3xl font-700 tabular-nums text-ink-900">{formatTime(seconds)}</p>
          </div>
        </div>
        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          <button type="button" onClick={() => setRunning((current) => !current)} className="btn-accent col-span-2"><>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</>{running ? 'Pause' : 'Start'} timer</button>
          <button type="button" onClick={() => { setRunning(false); setSeconds(60); }} className="btn col-span-2 bg-ink-100 text-ink-700 hover:bg-ink-200"><RotateCcw className="h-4 w-4" />Reset</button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-400">60 second rest countdown</p>
    </div>
  );
}
