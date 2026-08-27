import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react';
import { formatTime } from '@/utils/workout';
import { useRestTimer, DURATION_STEP, MIN_REST_SECONDS, MAX_REST_SECONDS } from '@/hooks/useRestTimer';

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type RestTimerProps = {
  /** Bump this (e.g. total sets logged) to auto-restart the countdown after a set is added. */
  restartSignal?: number;
};

export default function RestTimer({ restartSignal }: RestTimerProps) {
  const { seconds, duration, running, start, pause, reset, restart, adjustDuration } = useRestTimer();
  const progress = seconds / duration;
  const low = seconds > 0 && seconds <= 10;
  const done = seconds === 0;
  const ringColor = low ? '#C96936' : '#83A31E';
  const statusLabel = done ? 'Complete' : running ? 'Resting' : 'Ready';

  const prevSignal = useRef(restartSignal);
  useEffect(() => {
    if (restartSignal !== undefined && prevSignal.current !== undefined && restartSignal !== prevSignal.current) {
      restart();
    }
    prevSignal.current = restartSignal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartSignal]);

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-energy-400/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <Timer className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Rest Timer</p>
            <p className="text-xs text-ink-500">Auto-starts after each set</p>
          </div>
        </div>
        <span className="chip shrink-0 text-[11px]">{statusLabel}</span>
      </div>

      <div className="relative mt-5 flex flex-col items-center">
        <div className="relative grid h-44 w-44 place-items-center">
          {running && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: ringColor }}
              initial={{ opacity: 0.25, scale: 0.9 }}
              animate={{ opacity: [0.25, 0, 0.25], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <svg width="176" height="176" viewBox="0 0 176 176" className="relative -rotate-90">
            <circle cx="88" cy="88" r={RADIUS} fill="none" stroke="#E1D9C7" strokeWidth="9" />
            <motion.circle
              cx="88"
              cy="88"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
              transition={{ duration: 0.6, ease: 'linear' }}
            />
          </svg>
          <motion.p
            key={seconds}
            initial={{ opacity: 0.4, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute font-display text-4xl font-700 tabular-nums text-ink-900"
          >
            {formatTime(seconds)}
          </motion.p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ink-50/70 px-3 py-2">
          <span className="text-xs font-medium text-ink-500">Rest length</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustDuration(-DURATION_STEP)}
              disabled={running || duration <= MIN_REST_SECONDS}
              aria-label="Decrease rest time"
              className="grid h-7 w-7 place-items-center rounded-md bg-white text-ink-600 shadow-sm transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-semibold tabular-nums text-ink-900">{formatTime(duration)}</span>
            <button
              type="button"
              onClick={() => adjustDuration(DURATION_STEP)}
              disabled={running || duration >= MAX_REST_SECONDS}
              aria-label="Increase rest time"
              className="grid h-7 w-7 place-items-center rounded-md bg-white text-ink-600 shadow-sm transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={start}
            disabled={running || seconds === 0}
            className="btn-accent col-span-1 px-2 text-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Start
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={pause}
            disabled={!running}
            className="btn col-span-1 bg-ink-100 px-2 text-sm text-ink-700 hover:bg-ink-200"
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={reset}
            className="btn col-span-1 bg-ink-100 px-2 text-sm text-ink-700 hover:bg-ink-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </motion.button>
        </div>
      </div>
    </div>
  );
}
