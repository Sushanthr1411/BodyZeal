import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WorkoutStart from '@/components/workout/WorkoutStart';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import WorkoutSummary from '@/components/workout/WorkoutSummary';
import type { Exercise, Routine, WorkoutPhase, WorkoutSet } from '@/types/workout';
import { formatTime, groupSetsByExercise } from '@/utils/workout';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import {
  loadActiveSession,
  startSession,
  setActiveExercise as patchActiveExercise,
  logSessionSet,
  removeSessionSet,
  finishSession,
  discardSession,
  type ActiveSessionSnapshot,
} from '@/lib/activeSession';
import { loadCustomRoutines, deleteCustomRoutine, ApiError } from '@/lib/customRoutines';
import { loadWorkoutTimerState, saveWorkoutTimerState, clearWorkoutTimerState } from '@/lib/workoutTimerState';
import { DEFAULT_REST_SECONDS, MIN_REST_SECONDS, MAX_REST_SECONDS } from '@/hooks/useRestTimer';
import { ROUTINES } from '@/data/routines';
import { EXERCISES } from '@/data/exercises';
import { findNextIncompleteExercise, isExerciseComplete, routineProgress, type PlannedSetsMap } from '@/utils/routine';

type SessionStatus = 'loading' | 'setup' | 'active' | 'finished';

export default function LogWorkoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<SessionStatus>('loading');
  const [sessionError, setSessionError] = useState('');
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);
  const [routineError, setRoutineError] = useState('');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [finishedSummary, setFinishedSummary] = useState<RecentWorkout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plannedSets, setPlannedSets] = useState<PlannedSetsMap>({});
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [startedExerciseIds, setStartedExerciseIds] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);

  // Workout execution state — separate from `status` (which page/section renders).
  // The main workout timer only ticks while phase === 'ACTIVE'; it is not implied by
  // status === 'active' alone, so navigating into the page never starts it on its own.
  const [phase, setPhase] = useState<WorkoutPhase>('NOT_STARTED');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Rest is a countdown to a fixed point in time (an absolute end timestamp), not a
  // locally decrementing count — that's what lets it keep accurate real-world time
  // across a remount (reload, or navigating away and back), unlike the main timer.
  const [restEndAt, setRestEndAt] = useState<number | null>(null);
  const [restDurationSeconds, setRestDurationSeconds] = useState(DEFAULT_REST_SECONDS);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [isLoggingSet, setIsLoggingSet] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isRestartingExercise, setIsRestartingExercise] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  function applySnapshot(snapshot: ActiveSessionSnapshot) {
    setSessionId(snapshot.id);
    setRoutineId(snapshot.routineId);
    setWorkoutName(snapshot.workoutName);
    setExercises(snapshot.exercises);
    setPlannedSets(snapshot.plannedSets);
    setActiveExerciseId(snapshot.activeExerciseId);
    setEntries(snapshot.entries);
    // No backend field for "opened but not yet logged" — approximate on
    // resume as "has at least one logged set", which is what actually
    // matters for the UI (a badge, not a gate).
    setStartedExerciseIds(
      new Set(snapshot.exercises.filter((ex) => snapshot.entries.some((e) => e.exerciseName === ex.name)).map((ex) => ex.id)),
    );
  }

  // Resume an in-progress session, or land straight in one for "Log this
  // exercise" (from Exercise Detail) — a resumed session always wins.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resumed = await loadActiveSession();
      if (cancelled) return;
      if (resumed) {
        applySnapshot(resumed);
        // Prefer the locally remembered phase/elapsed value — it's exact and
        // survives a reload or navigating away and back (see workoutTimerState.ts).
        // It's only missing on a genuinely new device/tab, in which case fall back
        // to an approximation: `activeExerciseId` is set as soon as an exercise is
        // merely selected (long before "Start Exercise" is clicked), so it is NOT
        // a valid signal here — only actual logged sets prove the workout began.
        const stored = loadWorkoutTimerState(resumed.id);
        if (stored) {
          setElapsedSeconds(stored.elapsedSeconds);
          setRestDurationSeconds(stored.restDurationSeconds);
          if (stored.phase === 'RESTING' && stored.restEndAt != null) {
            // Rest is a real countdown to a fixed point in time, so it's allowed to
            // keep running across a remount — recompute what's actually left.
            const remaining = Math.max(0, Math.ceil((stored.restEndAt - Date.now()) / 1000));
            if (remaining > 0) {
              setRestEndAt(stored.restEndAt);
              setRestSecondsRemaining(remaining);
              setPhase('RESTING');
            } else {
              // Rest finished while the page was away — resume active automatically,
              // exactly like it would have if the page had stayed open the whole time.
              setRestEndAt(null);
              setPhase('ACTIVE');
            }
          } else if (stored.phase === 'RESTING') {
            // Rest was manually paused (frozen, no end timestamp) — that's already a
            // steady, non-ticking state, so it restores exactly as left, unpaused only
            // by an explicit click either way.
            setRestEndAt(null);
            setRestSecondsRemaining(stored.restSecondsRemaining);
            setPhase('RESTING');
          } else if (stored.phase === 'ACTIVE') {
            // Unlike rest, "actively lifting" has no fixed end point to recompute from,
            // so a remount never leaves it silently ticking — the user must explicitly
            // resume, exactly the same rule as the very first entry into the page.
            setRestEndAt(null);
            setPhase('MANUALLY_PAUSED');
          } else {
            // NOT_STARTED, MANUALLY_PAUSED, COMPLETED are steady states — pass through.
            setRestEndAt(null);
            setPhase(stored.phase);
          }
        } else if (resumed.entries.length > 0) {
          // No local record (new device/tab) but sets exist, so the workout was
          // genuinely underway — approximate elapsed time from wall-clock startedAt,
          // and land paused (no way to know rest state without the local record).
          setElapsedSeconds(Math.max(0, Math.floor((Date.now() - resumed.startedAt) / 1000)));
          setPhase('MANUALLY_PAUSED');
        } else {
          // Nothing logged yet — activeExerciseId may already be set (it's assigned
          // as soon as an exercise is merely selected, before "Start Exercise" is
          // ever clicked), so it is NOT proof the workout began. Only logged sets are.
          setElapsedSeconds(0);
          setPhase('NOT_STARTED');
        }
        setStatus('active');
        return;
      }
      const quickLogExerciseId = (location.state as { quickLogExerciseId?: string } | null)?.quickLogExerciseId;
      const quickLogExercise = quickLogExerciseId ? EXERCISES.find((e) => e.id === quickLogExerciseId) ?? null : null;
      if (quickLogExercise) {
        navigate(location.pathname, { replace: true, state: null });
        try {
          const started = await startSession({ routineId: null, name: quickLogExercise.name });
          const updated = await patchActiveExercise(started.id, quickLogExercise.id);
          if (!cancelled) {
            applySnapshot(updated);
            setElapsedSeconds(0);
            setRestEndAt(null);
            setPhase('NOT_STARTED');
            setStatus('active');
          }
        } catch {
          if (!cancelled) {
            setSessionError("Couldn't start a session for that exercise — try again from the workout screen.");
            setStatus('setup');
          }
        }
        return;
      }

      // Landed here from the Roadmap page's "Start this day" button — the routine
      // was already saved (or reused) there; this just starts a session for it.
      const startRoutine = (location.state as { startRoutineId?: string; startRoutineName?: string } | null);
      if (startRoutine?.startRoutineId && startRoutine.startRoutineName) {
        navigate(location.pathname, { replace: true, state: null });
        try {
          const started = await startSession({ routineId: startRoutine.startRoutineId, name: startRoutine.startRoutineName });
          const firstId = started.exercises[0]?.id ?? null;
          const finalSnapshot = firstId ? await patchActiveExercise(started.id, firstId) : started;
          if (!cancelled) {
            applySnapshot(finalSnapshot);
            setElapsedSeconds(0);
            setRestEndAt(null);
            setPhase('NOT_STARTED');
            setStatus('active');
          }
        } catch {
          if (!cancelled) {
            setSessionError("Couldn't start that roadmap day — try again from the workout screen.");
            setStatus('setup');
          }
        }
        return;
      }
      setStatus('setup');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRecentWorkouts().then(setRecentWorkouts);
  }, []);
  useEffect(() => {
    loadCustomRoutines().then(setCustomRoutines);
  }, []);

  // The main workout timer: ticks once per second only while actively running, and
  // pauses (cleanup clears the interval) the instant phase leaves 'ACTIVE' — during
  // RESTING, MANUALLY_PAUSED, COMPLETED, or before the workout has been started at all.
  useEffect(() => {
    if (phase !== 'ACTIVE') return;
    const interval = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  // The rest countdown: recomputed from the absolute restEndAt on every tick (and
  // immediately on mount/restEndAt change), so it reflects real elapsed time even
  // right after a remount restored restEndAt from storage. Auto-resumes the main
  // timer the instant it reaches zero — no separate "rest complete" callback needed.
  useEffect(() => {
    if (phase !== 'RESTING' || restEndAt == null) return;
    function tick() {
      const remaining = Math.max(0, Math.ceil((restEndAt! - Date.now()) / 1000));
      setRestSecondsRemaining(remaining);
      if (remaining <= 0) {
        setRestEndAt(null);
        setPhase((current) => (current === 'RESTING' ? 'ACTIVE' : current));
      }
    }
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [phase, restEndAt]);

  // Mirror phase/elapsed/rest state into sessionStorage so a remount (reload, or
  // navigating to another page and back) can restore it instead of guessing —
  // see workoutTimerState.ts for why that guess was the source of the bug.
  useEffect(() => {
    if (!sessionId || status !== 'active') return;
    saveWorkoutTimerState(sessionId, { phase, elapsedSeconds, restEndAt, restDurationSeconds, restSecondsRemaining });
  }, [sessionId, status, phase, elapsedSeconds, restEndAt, restDurationSeconds, restSecondsRemaining]);

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) ?? null;

  const groupedByExercise = useMemo(() => groupSetsByExercise(entries), [entries]);
  const activeSets = activeExercise
    ? entries.filter((entry) => entry.exerciseName === activeExercise.name)
    : [];
  const activeVolume = activeSets.reduce((total, set) => total + set.volume, 0);

  const { completed: exercisesCompletedPlanned } = routineProgress(exercises, entries, plannedSets);
  const isActiveExerciseComplete = activeExercise ? isExerciseComplete(activeExercise, entries, plannedSets) : false;
  const nextExercise = activeExercise ? findNextIncompleteExercise(exercises, activeExercise.id, entries, plannedSets) : null;

  const elapsedLabel = formatTime(elapsedSeconds);

  async function handleStartRoutine(routine: Routine) {
    if (isStartingSession) return;
    setSessionError('');
    setIsStartingSession(true);
    try {
      const started = await startSession({ routineId: routine.id, name: routine.name });
      const firstId = started.exercises[0]?.id ?? null;
      const finalSnapshot = firstId ? await patchActiveExercise(started.id, firstId) : started;
      applySnapshot(finalSnapshot);
      setStartedExerciseIds(new Set());
      setPickerOpen(false);
      setElapsedSeconds(0);
      setRestEndAt(null);
      setPhase('NOT_STARTED');
      setStatus('active');
    } catch (err) {
      setSessionError(
        err instanceof ApiError && err.code === 'CONFLICT'
          ? 'You already have a workout in progress.'
          : "Couldn't start that routine — try again.",
      );
    } finally {
      setIsStartingSession(false);
    }
  }

  async function handleStartCustom(name: string) {
    if (isStartingSession) return;
    setSessionError('');
    setIsStartingSession(true);
    try {
      const started = await startSession({ routineId: null, name });
      applySnapshot(started);
      setStartedExerciseIds(new Set());
      setElapsedSeconds(0);
      setRestEndAt(null);
      setPhase('NOT_STARTED');
      setStatus('active');
      setPickerOpen(true);
    } catch (err) {
      setSessionError(
        err instanceof ApiError && err.code === 'CONFLICT'
          ? 'You already have a workout in progress.'
          : "Couldn't start a custom workout — try again.",
      );
    } finally {
      setIsStartingSession(false);
    }
  }

  function handleSelectExercise(exercise: Exercise) {
    setExercises((current) => (current.some((item) => item.id === exercise.id) ? current : [...current, exercise]));
    setActiveExerciseId(exercise.id);
    setPickerOpen(false);
    if (sessionId) patchActiveExercise(sessionId, exercise.id).catch(() => setSessionError("Couldn't sync your exercise selection — it'll still work, but may not resume correctly if you reload."));
  }

  function handleAddExercise() {
    setPickerOpen(true);
  }

  function handleStartExercise() {
    if (!activeExerciseId) return;
    setStartedExerciseIds((current) => new Set(current).add(activeExerciseId));
    // First "Start Exercise" click of the session begins the main timer. If the
    // workout was RESTING when the user moved on and explicitly started the next
    // exercise, treat that as ready-to-go too. A manual pause is left untouched —
    // only an explicit Resume Workout can clear MANUALLY_PAUSED.
    setPhase((current) => (current === 'NOT_STARTED' || current === 'RESTING' ? 'ACTIVE' : current));
  }

  function handlePauseWorkout() {
    setPhase((current) => (current === 'ACTIVE' ? 'MANUALLY_PAUSED' : current));
  }

  function handleResumeWorkout() {
    setPhase((current) => (current === 'MANUALLY_PAUSED' ? 'ACTIVE' : current));
  }

  function handleAdjustRestDuration(delta: number) {
    setRestDurationSeconds((current) => Math.max(MIN_REST_SECONDS, Math.min(MAX_REST_SECONDS, current + delta)));
  }

  function handleSkipRest() {
    setPhase((current) => {
      if (current !== 'RESTING') return current;
      setRestEndAt(null);
      return 'ACTIVE';
    });
  }

  // Pauses/resumes the rest countdown itself — distinct from Pause Workout (which
  // only applies to the ACTIVE phase). Pausing just freezes restSecondsRemaining by
  // clearing restEndAt (the tick effect naturally stops with no end time to count
  // down to); resuming re-derives a fresh end timestamp from wherever it was frozen.
  function handleToggleRestPause() {
    if (phase !== 'RESTING') return;
    setRestEndAt((current) => (current == null ? Date.now() + restSecondsRemaining * 1000 : null));
  }

  function handleResetRest() {
    if (phase !== 'RESTING') return;
    setRestSecondsRemaining(restDurationSeconds);
    setRestEndAt(Date.now() + restDurationSeconds * 1000);
  }

  function handleNextExercise() {
    if (!nextExercise || !sessionId) return;
    setActiveExerciseId(nextExercise.id);
    setPickerOpen(false);
    patchActiveExercise(sessionId, nextExercise.id).catch(() => {});
  }

  function handleAddSets(setsCount: number, reps: number, weight: number) {
    if (!activeExercise || !sessionId || isLoggingSet) return;
    setSessionError('');
    setIsLoggingSet(true);
    const tempId = crypto.randomUUID();
    const optimistic: WorkoutSet = {
      id: tempId,
      exerciseName: activeExercise.name,
      sets: setsCount,
      reps,
      weight,
      volume: setsCount * reps * weight,
      loggedAt: new Date().toISOString(),
    };
    setEntries((current) => [...current, optimistic]); // optimistic — one aggregate row, per Phase 3C
    logSessionSet(sessionId, { exerciseId: activeExercise.id, sets: setsCount, reps, weight })
      .then((saved) => {
        setEntries((current) => current.map((e) => (e.id === tempId ? saved : e)));
        setStartedExerciseIds((current) => new Set(current).add(activeExercise.id));

        // Only decide the rest-vs-complete transition once the set is confirmed
        // persisted — never start resting (or stop the timer) on an optimistic guess.
        const entriesWithNew = [...entries, optimistic];
        const exerciseStillIncomplete = !isExerciseComplete(activeExercise, entriesWithNew, plannedSets);
        const anotherExerciseRemains = findNextIncompleteExercise(exercises, activeExercise.id, entriesWithNew, plannedSets) !== null;

        if (exerciseStillIncomplete || anotherExerciseRemains) {
          setRestSecondsRemaining(restDurationSeconds);
          setRestEndAt(Date.now() + restDurationSeconds * 1000);
          setPhase('RESTING');
        } else {
          // Final required set of the whole workout — stop the main timer, no rest.
          setRestEndAt(null);
          setPhase('COMPLETED');
        }
      })
      .catch(() => {
        setEntries((current) => current.filter((e) => e.id !== tempId)); // rollback
        setSessionError("Couldn't log that set — try again.");
      })
      .finally(() => setIsLoggingSet(false));
  }

  function handleRestartExercise() {
    if (!activeExercise || !sessionId || isRestartingExercise || activeSets.length === 0) return;
    if (
      !window.confirm(
        `Restart ${activeExercise.name}? This clears every set you've logged for it, and resets the workout timer and rest timer back to 00:00.`,
      )
    ) {
      return;
    }
    setSessionError('');
    setIsRestartingExercise(true);
    const exerciseName = activeExercise.name;
    const idsToRemove = activeSets.map((set) => set.id);
    const removedEntries = entries.filter((entry) => idsToRemove.includes(entry.id));
    setEntries((current) => current.filter((entry) => !idsToRemove.includes(entry.id))); // optimistic
    Promise.all(idsToRemove.map((id) => removeSessionSet(sessionId, id)))
      .then(() => {
        setStartedExerciseIds((current) => {
          const next = new Set(current);
          next.delete(activeExercise.id);
          return next;
        });
        // "Start from scratch" means the timers reset too, not just the logged
        // data — back to 00:00/00:00 and NOT_STARTED, exactly like a fresh entry
        // into the page, requiring an explicit Start Exercise click to resume.
        setElapsedSeconds(0);
        setRestEndAt(null);
        setRestSecondsRemaining(0);
        setPhase('NOT_STARTED');
      })
      .catch(() => {
        // A partial failure could leave some sets deleted and others not — resync
        // from the backend instead of guessing, so local state never lies about
        // what's actually persisted.
        setEntries((current) => [...current.filter((entry) => !idsToRemove.includes(entry.id)), ...removedEntries]);
        setSessionError(`Couldn't fully restart ${exerciseName} — try again.`);
        loadActiveSession().then((snapshot) => {
          if (snapshot) applySnapshot(snapshot);
        });
      })
      .finally(() => setIsRestartingExercise(false));
  }

  async function handleTerminateWorkout() {
    if (!sessionId || isTerminating) return;
    if (!window.confirm('Cancel this workout? All progress in this session will be discarded and will not be saved.')) {
      return;
    }
    setSessionError('');
    setIsTerminating(true);
    try {
      await discardSession(sessionId);
      clearWorkoutTimerState(sessionId);
      handleStartNew();
    } catch {
      setSessionError("Couldn't cancel the workout — try again.");
    } finally {
      setIsTerminating(false);
    }
  }

  function handleRemoveSet(id: string) {
    if (!sessionId) return;
    setSessionError('');
    const removed = entries.find((entry) => entry.id === id);
    setEntries((current) => current.filter((entry) => entry.id !== id)); // optimistic
    removeSessionSet(sessionId, id).catch(() => {
      if (removed) setEntries((current) => [...current, removed]); // rollback
      setSessionError("Couldn't remove that set — try again.");
    });
  }

  async function handleFinish() {
    if (!sessionId) return;
    setSessionError('');
    try {
      // elapsedSeconds is what the user actually watched counting on screen — paused
      // during rest/manual pause, reset by Restart Exercise — not the raw wall-clock
      // time since the session began, which would include all of that paused time.
      const summary = await finishSession(sessionId, elapsedSeconds);
      clearWorkoutTimerState(sessionId);
      setFinishedSummary(summary);
      setPhase('COMPLETED');
      setStatus('finished');
      setRecentWorkouts((current) => [summary, ...current].slice(0, 20));
    } catch {
      setSessionError("Couldn't finish the workout — your progress is saved, try finishing again.");
    }
  }

  function handleStartNew() {
    setStatus('setup');
    setSessionId(null);
    setRoutineId(null);
    setWorkoutName('');
    setFinishedSummary(null);
    setExercises([]);
    setPlannedSets({});
    setActiveExerciseId(null);
    setStartedExerciseIds(new Set());
    setEntries([]);
    setPickerOpen(false);
    setEquipment(ALL_EQUIPMENT);
    setMuscleGroup(ALL_MUSCLE_GROUPS);
    setPhase('NOT_STARTED');
    setElapsedSeconds(0);
    setRestEndAt(null);
    setRestSecondsRemaining(0);
  }

  const exercisesTouched = groupedByExercise.filter((group) => group.sets.length > 0).length;

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="px-4 py-16 text-center text-sm text-ink-500 sm:px-6 lg:px-8">
          Loading your workout...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {sessionError && (
            <p role="alert" className="mx-auto mb-3 max-w-2xl text-sm font-medium text-red-600">{sessionError}</p>
          )}

          {status === 'setup' && (
            <>
              {routineError && (
                <p role="alert" className="mx-auto mb-3 max-w-2xl text-sm font-medium text-red-600">{routineError}</p>
              )}
              <WorkoutStart
                routines={ROUTINES}
                customRoutines={customRoutines}
                onStartRoutine={handleStartRoutine}
                onStartCustom={handleStartCustom}
                onCreateRoutine={() => navigate('/workout/new')}
                onDeleteCustomRoutine={(id) => {
                  setRoutineError('');
                  deleteCustomRoutine(id)
                    .then(() => setCustomRoutines((current) => current.filter((routine) => routine.id !== id)))
                    .catch((err) => {
                      setRoutineError(
                        err instanceof ApiError && err.code === 'CONFLICT'
                          ? "This routine has workout history and can't be deleted."
                          : 'Could not delete this routine. Try again.',
                      );
                    });
                }}
                recentWorkouts={recentWorkouts}
              />
            </>
          )}

          {status === 'active' && (
            <ActiveWorkout
              workoutName={workoutName}
              elapsedLabel={elapsedLabel}
              phase={phase}
              exercises={exercises}
              activeExercise={activeExercise}
              pickerOpen={pickerOpen}
              onTogglePicker={() => setPickerOpen((current) => !current)}
              equipment={equipment}
              muscleGroup={muscleGroup}
              onEquipmentChange={setEquipment}
              onMuscleGroupChange={setMuscleGroup}
              onSelectExercise={handleSelectExercise}
              activeSets={activeSets}
              activeVolume={activeVolume}
              onAddSets={handleAddSets}
              onRemoveSet={handleRemoveSet}
              entries={entries}
              plannedSets={plannedSets}
              onSelectRosterExercise={(exercise) => handleSelectExercise(exercise)}
              onAddExercise={handleAddExercise}
              onFinish={handleFinish}
              onTerminateWorkout={handleTerminateWorkout}
              isTerminating={isTerminating}
              started={activeExercise ? startedExerciseIds.has(activeExercise.id) : false}
              onStartExercise={handleStartExercise}
              isLoggingSet={isLoggingSet}
              isResting={phase === 'RESTING'}
              restSecondsRemaining={restSecondsRemaining}
              restDurationSeconds={restDurationSeconds}
              onAdjustRestDuration={handleAdjustRestDuration}
              onSkipRest={handleSkipRest}
              isRestPaused={phase === 'RESTING' && restEndAt == null}
              onToggleRestPause={handleToggleRestPause}
              onResetRest={handleResetRest}
              onPauseWorkout={handlePauseWorkout}
              onResumeWorkout={handleResumeWorkout}
              onRestartExercise={handleRestartExercise}
              isRestartingExercise={isRestartingExercise}
              isActiveExerciseComplete={isActiveExerciseComplete}
              hasNextExercise={Boolean(nextExercise)}
              onNextExercise={handleNextExercise}
              exercisesCompleted={exercisesCompletedPlanned}
            />
          )}

          {status === 'finished' && finishedSummary && (
            <WorkoutSummary
              workoutName={finishedSummary.name}
              exercisesCompleted={exercisesTouched}
              totalSets={finishedSummary.totalSets ?? entries.length}
              totalVolume={finishedSummary.totalVolume}
              durationSeconds={finishedSummary.durationSeconds ?? 0}
              onStartNew={handleStartNew}
              onBackToDashboard={() => navigate('/dashboard')}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
