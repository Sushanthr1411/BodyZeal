import { useEffect, useState } from 'react';

export const DEFAULT_REST_SECONDS = 60;

export function useRestTimer(defaultSeconds: number = DEFAULT_REST_SECONDS) {
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

  function start() {
    if (seconds > 0) setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSeconds(defaultSeconds);
  }

  function toggle() {
    setRunning((current) => !current);
  }

  return { seconds, running, start, pause, reset, toggle };
}
