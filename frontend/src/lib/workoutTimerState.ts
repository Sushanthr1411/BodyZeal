// The main workout timer's phase/elapsed-seconds live in plain React state in
// LogWorkoutPage, which is wiped on every remount — a page reload, or just
// navigating to another route and back (React Router unmounts the page).
// Without this, a remount had to re-derive phase from the backend snapshot,
// and the only available signal (activeExerciseId) is set as soon as an
// exercise is merely *selected* — well before "Start Exercise" is clicked —
// so the timer would appear to start itself on reload/navigation. Mirroring
// the last known phase/elapsed value in sessionStorage (scoped to this tab,
// cleared on finish/cancel/new-session) lets a remount restore exactly what
// the user left, including MANUALLY_PAUSED and RESTING, instead of guessing.
import type { WorkoutPhase } from '@/types/workout';

const KEY_PREFIX = 'bodyzeal:workoutTimer:';

export type StoredWorkoutTimerState = {
  phase: WorkoutPhase;
  elapsedSeconds: number;
  // Rest, unlike "actively lifting", is a real countdown to a fixed point in time —
  // storing the absolute end timestamp (not a remaining-seconds count) means a
  // remount can recompute exactly how much is left (or that it already finished)
  // from Date.now(), the same way an alarm clock keeps time while your screen is off.
  restEndAt: number | null;
  restDurationSeconds: number;
  // Authoritative only while restEndAt is null and phase is RESTING (the rest
  // countdown itself was manually paused) — there's no end timestamp to recompute
  // from in that case, so the frozen remaining value has to be carried explicitly.
  restSecondsRemaining: number;
};

export function loadWorkoutTimerState(sessionId: string): StoredWorkoutTimerState | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + sessionId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.phase !== 'string' || typeof parsed?.elapsedSeconds !== 'number') return null;
    return {
      phase: parsed.phase,
      elapsedSeconds: parsed.elapsedSeconds,
      restEndAt: typeof parsed.restEndAt === 'number' ? parsed.restEndAt : null,
      restDurationSeconds: typeof parsed.restDurationSeconds === 'number' ? parsed.restDurationSeconds : 60,
      restSecondsRemaining: typeof parsed.restSecondsRemaining === 'number' ? parsed.restSecondsRemaining : 0,
    };
  } catch {
    return null;
  }
}

export function saveWorkoutTimerState(sessionId: string, state: StoredWorkoutTimerState): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + sessionId, JSON.stringify(state));
  } catch {
    // Best-effort only (private browsing, storage disabled, quota) — the
    // timer still works within the current mount, it just won't survive one.
  }
}

export function clearWorkoutTimerState(sessionId: string): void {
  try {
    sessionStorage.removeItem(KEY_PREFIX + sessionId);
  } catch {
    // ignore
  }
}
