import { motion } from 'framer-motion';
import { Timer, Minus, Plus, SkipForward, Pause, Play, RotateCcw } from 'lucide-react';
import { formatTime } from '@/utils/workout';
import { DURATION_STEP, MIN_REST_SECONDS, MAX_REST_SECONDS } from '@/hooks/useRestTimer';

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Fully controlled by LogWorkoutPage (which owns restEndAt as an absolute
// timestamp, not a local decrementing count) so that RESTING survives a
// remount — reloading the page, or navigating away and back — instead of
// resetting: the remaining time is always recomputed from Date.now(), the
// same way a real countdown keeps time while the page isn't mounted.
type RestTimerProps = {
  isResting: boolean;
  secondsRemaining: number;
  durationSeconds: number;
  onAdjustDuration: (delta: number) => void;
  onSkipRest: () => void;
  isRestPaused: boolean;
  onTogglePause: () => void;
  onResetRest: () => void;
};

export default function RestTimer({
  isResting,
  secondsRemaining,
  durationSeconds,
  onAdjustDuration,
  onSkipRest,
  isRestPaused,
  onTogglePause,
  onResetRest,
}: RestTimerProps) {
  const displaySeconds = isResting ? secondsRemaining : durationSeconds;
  const progress = isResting ? secondsRemaining / durationSeconds : 1;
  const low = isResting && secondsRemaining > 0 && secondsRemaining <= 10;
  const done = isResting && secondsRemaining === 0;
  const ringColor = low ? '#C96936' : '#83A31E';
  const statusLabel = done ? 'Complete' : isRestPaused ? 'Paused' : isResting ? 'Resting' : 'Ready';

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
          {isResting && !isRestPaused && (
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
            key={displaySeconds}
            initial={{ opacity: 0.4, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute font-display text-4xl font-700 tabular-nums text-ink-900"
          >
            {formatTime(displaySeconds)}
          </motion.p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ink-50/70 px-3 py-2">
          <span className="text-xs font-medium text-ink-500">Rest length</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAdjustDuration(-DURATION_STEP)}
              disabled={isResting || durationSeconds <= MIN_REST_SECONDS}
              aria-label="Decrease rest time"
              className="grid h-7 w-7 place-items-center rounded-md bg-white text-ink-600 shadow-sm transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-semibold tabular-nums text-ink-900">{formatTime(durationSeconds)}</span>
            <button
              type="button"
              onClick={() => onAdjustDuration(DURATION_STEP)}
              disabled={isResting || durationSeconds >= MAX_REST_SECONDS}
              aria-label="Increase rest time"
              className="grid h-7 w-7 place-items-center rounded-md bg-white text-ink-600 shadow-sm transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onSkipRest}
          disabled={!isResting}
          className="btn-accent mt-4 w-full text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip Rest
        </motion.button>

        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onTogglePause}
            disabled={!isResting}
            className="btn w-full justify-center bg-ink-100 py-2.5 text-xs text-ink-700 hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRestPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isRestPaused ? 'Resume' : 'Pause'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onResetRest}
            disabled={!isResting}
            className="btn w-full justify-center bg-ink-100 py-2.5 text-xs text-ink-700 hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Timer
          </motion.button>
        </div>
      </div>
    </div>
  );
}
