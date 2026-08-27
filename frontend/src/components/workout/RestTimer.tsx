import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { formatTime } from '@/utils/workout';
import { useRestTimer, DEFAULT_REST_SECONDS } from '@/hooks/useRestTimer';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RestTimer() {
  const { seconds, running, start, pause, reset } = useRestTimer();
  const progress = seconds / DEFAULT_REST_SECONDS;
  const low = seconds > 0 && seconds <= 10;
  const ringColor = low ? '#C96936' : '#83A31E';

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-energy-400/10 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
          <Timer className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">Rest Timer</p>
          <p className="text-xs text-ink-500">Countdown between sets</p>
        </div>
      </div>

      <div className="relative mt-5 flex flex-col items-center">
        <div className="relative grid h-32 w-32 place-items-center">
          {running && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: ringColor }}
              initial={{ opacity: 0.25, scale: 0.9 }}
              animate={{ opacity: [0.25, 0, 0.25], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <svg width="128" height="128" viewBox="0 0 128 128" className="relative -rotate-90">
            <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#E1D9C7" strokeWidth="8" />
            <motion.circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
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
            className="absolute font-display text-3xl font-700 tabular-nums text-ink-900"
          >
            {formatTime(seconds)}
          </motion.p>
        </div>

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
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
