import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WorkoutStart from '@/components/workout/WorkoutStart';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import WorkoutSummary from '@/components/workout/WorkoutSummary';
import type { Exercise, Routine, WorkoutSet } from '@/types/workout';
import { calcVolume, formatTime, groupSetsByExercise } from '@/utils/workout';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import { loadRecentWorkouts, saveRecentWorkout, type RecentWorkout } from '@/lib/recentWorkouts';
import { loadActiveSession, saveActiveSession, clearActiveSession } from '@/lib/activeSession';
import { loadCustomRoutines, deleteCustomRoutine } from '@/lib/customRoutines';
import { ROUTINES } from '@/data/routines';
import { EXERCISES } from '@/data/exercises';
import { findNextIncompleteExercise, isExerciseComplete, routineProgress, type PlannedSetsMap } from '@/utils/routine';

type SessionStatus = 'setup' | 'active' | 'finished';

export default function LogWorkoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resumed = useMemo(() => loadActiveSession(), []);
  // "Log this exercise" from the Exercise Detail page — jumps straight into an active
  // custom session with that exercise pre-selected. A resumed in-progress session wins.
  const quickLogExercise = useMemo(() => {
    if (resumed) return null;
    const exerciseId = (location.state as { quickLogExerciseId?: string } | null)?.quickLogExerciseId;
    return exerciseId ? EXERCISES.find((exercise) => exercise.id === exerciseId) ?? null : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quickLogExercise) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [status, setStatus] = useState<SessionStatus>(() => (resumed || quickLogExercise ? 'active' : 'setup'));
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>(() => loadRecentWorkouts());
  const [customRoutines, setCustomRoutines] = useState<Routine[]>(() => loadCustomRoutines());
  const [routineId, setRoutineId] = useState<string | null>(() => resumed?.routineId ?? null);
  const [workoutName, setWorkoutName] = useState(() => resumed?.workoutName ?? quickLogExercise?.name ?? '');
  const [startedAt, setStartedAt] = useState<number | null>(() => resumed?.startedAt ?? (quickLogExercise ? Date.now() : null));
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(() => resumed?.exercises ?? (quickLogExercise ? [quickLogExercise] : []));
  const [plannedSets, setPlannedSets] = useState<PlannedSetsMap>(() => resumed?.plannedSets ?? {});
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(() => resumed?.activeExerciseId ?? quickLogExercise?.id ?? null);
  const [startedExerciseIds, setStartedExerciseIds] = useState<Set<string>>(() => new Set(resumed?.startedExerciseIds ?? []));
  const [entries, setEntries] = useState<WorkoutSet[]>(() => resumed?.entries ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== 'active') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  // Persist the in-progress session (frontend-only, localStorage) so it survives navigation
  // and the Dashboard can show "Continue Workout".
  useEffect(() => {
    if (status !== 'active') return;
    saveActiveSession({
      routineId,
      workoutName,
      startedAt: startedAt ?? Date.now(),
      exercises,
      plannedSets,
      activeExerciseId,
      startedExerciseIds: Array.from(startedExerciseIds),
      entries,
    });
  }, [status, routineId, workoutName, startedAt, exercises, plannedSets, activeExerciseId, startedExerciseIds, entries]);

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
  const durationSeconds = startedAt && finishedAt ? Math.max(0, Math.floor((finishedAt - startedAt) / 1000)) : elapsedSeconds;
  const elapsedLabel = formatTime(elapsedSeconds);

  function handleStartRoutine(routine: Routine) {
    const seeded = routine.exercises
      .map((planned) => EXERCISES.find((exercise) => exercise.id === planned.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const plannedMap: PlannedSetsMap = {};
    routine.exercises.forEach((planned) => {
      if (EXERCISES.some((exercise) => exercise.id === planned.exerciseId)) {
        plannedMap[planned.exerciseId] = planned.plannedSets;
      }
    });
    setRoutineId(routine.id);
    setWorkoutName(routine.name);
    setStartedAt(Date.now());
    setFinishedAt(null);
    setExercises(seeded);
    setPlannedSets(plannedMap);
    setActiveExerciseId(seeded[0]?.id ?? null);
    setStartedExerciseIds(new Set());
    setEntries([]);
    setPickerOpen(false);
    setStatus('active');
  }

  function handleStartCustom(name: string) {
    setRoutineId(null);
    setWorkoutName(name);
    setStartedAt(Date.now());
    setFinishedAt(null);
    setExercises([]);
    setPlannedSets({});
    setActiveExerciseId(null);
    setStartedExerciseIds(new Set());
    setEntries([]);
    setStatus('active');
    setPickerOpen(true);
  }

  function handleSelectExercise(exercise: Exercise) {
    setExercises((current) => (current.some((item) => item.id === exercise.id) ? current : [...current, exercise]));
    setActiveExerciseId(exercise.id);
    setPickerOpen(false);
  }

  function handleAddExercise() {
    setPickerOpen(true);
  }

  function handleStartExercise() {
    if (!activeExerciseId) return;
    setStartedExerciseIds((current) => new Set(current).add(activeExerciseId));
  }

  function handleNextExercise() {
    if (nextExercise) {
      setActiveExerciseId(nextExercise.id);
      setPickerOpen(false);
    }
  }

  function handleAddSets(setsCount: number, reps: number, weight: number) {
    if (!activeExercise) return;
    const newEntries: WorkoutSet[] = Array.from({ length: setsCount }, () => ({
      id: crypto.randomUUID(),
      exerciseName: activeExercise.name,
      sets: 1,
      reps,
      weight,
      volume: calcVolume(1, reps, weight),
      loggedAt: new Date().toISOString(),
    }));
    setEntries((current) => [...current, ...newEntries]);
  }

  function handleRemoveSet(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleFinish() {
    const finishTime = Date.now();
    setFinishedAt(finishTime);
    setStatus('finished');
    clearActiveSession();
    const record = {
      name: workoutName,
      finishedAt: new Date(finishTime).toISOString(),
      totalVolume: entries.reduce((total, entry) => total + entry.volume, 0),
      totalSets: entries.length,
      sets: entries.map((entry) => ({
        exerciseName: entry.exerciseName,
        reps: entry.reps,
        weight: entry.weight,
        volume: entry.volume,
      })),
      durationSeconds: startedAt ? Math.max(0, Math.floor((finishTime - startedAt) / 1000)) : 0,
    };
    saveRecentWorkout(record);
    setRecentWorkouts((current) => [record, ...current].slice(0, 20));
  }

  function handleStartNew() {
    clearActiveSession();
    setStatus('setup');
    setRoutineId(null);
    setWorkoutName('');
    setStartedAt(null);
    setFinishedAt(null);
    setExercises([]);
    setPlannedSets({});
    setActiveExerciseId(null);
    setStartedExerciseIds(new Set());
    setEntries([]);
    setPickerOpen(false);
    setEquipment(ALL_EQUIPMENT);
    setMuscleGroup(ALL_MUSCLE_GROUPS);
  }

  const totalVolume = entries.reduce((total, entry) => total + entry.volume, 0);
  const exercisesTouched = groupedByExercise.filter((group) => group.sets.length > 0).length;

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {status === 'setup' && (
            <WorkoutStart
              routines={ROUTINES}
              customRoutines={customRoutines}
              onStartRoutine={handleStartRoutine}
              onStartCustom={handleStartCustom}
              onCreateRoutine={() => navigate('/workout/new')}
              onDeleteCustomRoutine={(id) => {
                deleteCustomRoutine(id);
                setCustomRoutines((current) => current.filter((routine) => routine.id !== id));
              }}
              recentWorkouts={recentWorkouts}
            />
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
              onSelectRosterExercise={(exercise) => { setActiveExerciseId(exercise.id); setPickerOpen(false); }}
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

          {status === 'finished' && (
            <WorkoutSummary
              workoutName={workoutName}
              exercisesCompleted={exercisesTouched}
              totalSets={entries.length}
              totalVolume={totalVolume}
              durationSeconds={durationSeconds}
              onStartNew={handleStartNew}
              onBackToDashboard={() => navigate('/dashboard')}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
