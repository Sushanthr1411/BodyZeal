import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { formatTime } from '@/utils/workout';
import { useRestTimer, DEFAULT_REST_SECONDS } from '@/hooks/useRestTimer';

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RestTimerCard() {
  const { seconds, running, toggle, reset } = useRestTimer();
  const progress = seconds / DEFAULT_REST_SECONDS;
  const low = seconds > 0 && seconds <= 10;
  const done = seconds === 0;
  const ringColor = low ? '#C96936' : '#83A31E';
  const statusLabel = done ? 'Complete' : running ? 'Resting' : 'Ready';

  return (
    <div className="card relative flex h-full flex-col overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-energy-400/10 blur-3xl" />

      <div className="relative flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-energy-400">
          <Timer className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Rest Timer</p>
          <p className="truncate text-xs text-ink-500">Between sets</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-1 items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center">
          {running && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: ringColor }}
              initial={{ opacity: 0.25, scale: 0.9 }}
              animate={{ opacity: [0.25, 0, 0.25], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <svg width="96" height="96" viewBox="0 0 96 96" className="relative -rotate-90">
            <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="#E1D9C7" strokeWidth="7" />
            <motion.circle
              cx="48"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
              transition={{ duration: 0.6, ease: 'linear' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <motion.p
              key={seconds}
              initial={{ opacity: 0.4, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="font-display text-xl font-semibold tabular-nums text-ink-900"
            >
              {formatTime(seconds)}
            </motion.p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{statusLabel}</p>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={toggle}
              className="btn-accent flex-1 px-3 py-2.5 text-sm"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? 'Pause' : 'Start'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={reset}
              aria-label="Reset timer"
              className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700 transition-colors hover:bg-ink-200"
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
