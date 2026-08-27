import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WorkoutStart from '@/components/workout/WorkoutStart';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import WorkoutSummary from '@/components/workout/WorkoutSummary';
import type { Exercise, Routine, WorkoutSet } from '@/types/workout';
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
  type ActiveSessionSnapshot,
} from '@/lib/activeSession';
import { loadCustomRoutines, deleteCustomRoutine, ApiError } from '@/lib/customRoutines';
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
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<RecentWorkout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plannedSets, setPlannedSets] = useState<PlannedSetsMap>({});
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [startedExerciseIds, setStartedExerciseIds] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [now, setNow] = useState(() => Date.now());

  function applySnapshot(snapshot: ActiveSessionSnapshot) {
    setSessionId(snapshot.id);
    setRoutineId(snapshot.routineId);
    setWorkoutName(snapshot.workoutName);
    setStartedAt(snapshot.startedAt);
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

  useEffect(() => {
    if (status !== 'active') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) ?? null;

  const groupedByExercise = useMemo(() => groupSetsByExercise(entries), [entries]);
  const activeSets = activeExercise
    ? entries.filter((entry) => entry.exerciseName === activeExercise.name)
    : [];
  const activeVolume = activeSets.reduce((total, set) => total + set.volume, 0);

  const { completed: exercisesCompletedPlanned } = routineProgress(exercises, entries, plannedSets);
  const isActiveExerciseComplete = activeExercise ? isExerciseComplete(activeExercise, entries, plannedSets) : false;
  const nextExercise = activeExercise ? findNextIncompleteExercise(exercises, activeExercise.id, entries, plannedSets) : null;

  const elapsedSeconds = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const elapsedLabel = formatTime(elapsedSeconds);

  async function handleStartRoutine(routine: Routine) {
    setSessionError('');
    try {
      const started = await startSession({ routineId: routine.id, name: routine.name });
      const firstId = started.exercises[0]?.id ?? null;
      const finalSnapshot = firstId ? await patchActiveExercise(started.id, firstId) : started;
      applySnapshot(finalSnapshot);
      setStartedExerciseIds(new Set());
      setPickerOpen(false);
      setStatus('active');
    } catch (err) {
      setSessionError(
        err instanceof ApiError && err.code === 'CONFLICT'
          ? 'You already have a workout in progress.'
          : "Couldn't start that routine — try again.",
      );
    }
  }

  async function handleStartCustom(name: string) {
    setSessionError('');
    try {
      const started = await startSession({ routineId: null, name });
      applySnapshot(started);
      setStartedExerciseIds(new Set());
      setStatus('active');
      setPickerOpen(true);
    } catch (err) {
      setSessionError(
        err instanceof ApiError && err.code === 'CONFLICT'
          ? 'You already have a workout in progress.'
          : "Couldn't start a custom workout — try again.",
      );
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
  }

  function handleNextExercise() {
    if (!nextExercise || !sessionId) return;
    setActiveExerciseId(nextExercise.id);
    setPickerOpen(false);
    patchActiveExercise(sessionId, nextExercise.id).catch(() => {});
  }

  function handleAddSets(setsCount: number, reps: number, weight: number) {
    if (!activeExercise || !sessionId) return;
    setSessionError('');
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
      })
      .catch(() => {
        setEntries((current) => current.filter((e) => e.id !== tempId)); // rollback
        setSessionError("Couldn't log that set — try again.");
      });
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
      const summary = await finishSession(sessionId);
      setFinishedSummary(summary);
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
    setStartedAt(null);
    setFinishedSummary(null);
    setExercises([]);
    setPlannedSets({});
    setActiveExerciseId(null);
    setStartedExerciseIds(new Set());
    setEntries([]);
    setPickerOpen(false);
    setEquipment(ALL_EQUIPMENT);
    setMuscleGroup(ALL_MUSCLE_GROUPS);
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
              started={activeExercise ? startedExerciseIds.has(activeExercise.id) : false}
              onStartExercise={handleStartExercise}
              totalSetsLogged={entries.length}
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
