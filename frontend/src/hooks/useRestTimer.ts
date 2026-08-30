import { useEffect, useState } from 'react';

export const DEFAULT_REST_SECONDS = 60;
export const MIN_REST_SECONDS = 15;
export const MAX_REST_SECONDS = 300;
const DURATION_STEP = 15;

export function useRestTimer(defaultSeconds: number = DEFAULT_REST_SECONDS, onComplete?: () => void) {
  const [duration, setDurationState] = useState(defaultSeconds);
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  // Fires once when the countdown actually reaches zero (never on mount —
  // defaultSeconds/duration are always >= MIN_REST_SECONDS).
  useEffect(() => {
    if (seconds === 0) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  function start() {
    if (seconds > 0) setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSeconds(duration);
  }

  function restart() {
    setSeconds(duration);
    setRunning(true);
  }

  function toggle() {
    setRunning((current) => !current);
  }

  function setDuration(next: number) {
    const clamped = Math.max(MIN_REST_SECONDS, Math.min(MAX_REST_SECONDS, next));
    setDurationState(clamped);
    setRunning(false);
    setSeconds(clamped);
  }

  function adjustDuration(delta: number) {
    setDuration(duration + delta);
  }

  return { seconds, duration, running, start, pause, reset, restart, toggle, setDuration, adjustDuration };
}

export { DURATION_STEP };
