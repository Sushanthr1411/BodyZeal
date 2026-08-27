import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WorkoutStart from '@/components/workout/WorkoutStart';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import WorkoutSummary from '@/components/workout/WorkoutSummary';
import type { Exercise, WorkoutSet } from '@/types/workout';
import { calcVolume, groupSetsByExercise } from '@/utils/workout';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import { loadRecentWorkouts, saveRecentWorkout, type RecentWorkout } from '@/lib/recentWorkouts';

type SessionStatus = 'setup' | 'active' | 'finished';

export default function LogWorkoutPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SessionStatus>('setup');
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>(() => loadRecentWorkouts());
  const [workoutName, setWorkoutName] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [entries, setEntries] = useState<WorkoutSet[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== 'active') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) ?? null;

  const groupedByExercise = useMemo(() => groupSetsByExercise(entries), [entries]);
  const setCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of groupedByExercise) counts[group.exerciseName] = group.sets.length;
    return counts;
  }, [groupedByExercise]);

  const activeSets = activeExercise
    ? entries.filter((entry) => entry.exerciseName === activeExercise.name)
    : [];
  const activeVolume = activeSets.reduce((total, set) => total + set.volume, 0);

  const elapsedSeconds = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const durationSeconds = startedAt && finishedAt ? Math.max(0, Math.floor((finishedAt - startedAt) / 1000)) : elapsedSeconds;
  const elapsedLabel = elapsedSeconds < 60 ? '<1 min' : `${Math.floor(elapsedSeconds / 60)} min`;

  function handleStart(name: string) {
    setWorkoutName(name);
    setStartedAt(Date.now());
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
    };
    saveRecentWorkout(record);
    setRecentWorkouts((current) => [record, ...current].slice(0, 20));
  }

  function handleStartNew() {
    setStatus('setup');
    setWorkoutName('');
    setStartedAt(null);
    setFinishedAt(null);
    setExercises([]);
    setActiveExerciseId(null);
    setEntries([]);
    setPickerOpen(false);
    setEquipment(ALL_EQUIPMENT);
    setMuscleGroup(ALL_MUSCLE_GROUPS);
  }

  const totalVolume = entries.reduce((total, entry) => total + entry.volume, 0);
  const exercisesCompleted = groupedByExercise.filter((group) => group.sets.length > 0).length;

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {status === 'setup' && <WorkoutStart onStart={handleStart} recentWorkouts={recentWorkouts} />}

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
              setCounts={setCounts}
              onSelectRosterExercise={(exercise) => { setActiveExerciseId(exercise.id); setPickerOpen(false); }}
              onAddExercise={handleAddExercise}
              onFinish={handleFinish}
            />
          )}

          {status === 'finished' && (
            <WorkoutSummary
              workoutName={workoutName}
              exercisesCompleted={exercisesCompleted}
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
