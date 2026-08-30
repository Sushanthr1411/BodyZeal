import { Flag, Pause, Play, RotateCcw, Timer, XCircle } from 'lucide-react';
import type { Exercise, WorkoutPhase, WorkoutSet } from '@/types/workout';
import type { EquipmentFilter, MuscleGroupFilter } from '@/utils/exercises';
import type { PlannedSetsMap } from '@/utils/routine';
import ExerciseSessionCard from '@/components/workout/ExerciseSessionCard';
import RestTimer from '@/components/workout/RestTimer';
import WorkoutExerciseList from '@/components/workout/WorkoutExerciseList';

type ActiveWorkoutProps = {
  workoutName: string;
  elapsedLabel: string;
  phase: WorkoutPhase;
  exercises: Exercise[];
  activeExercise: Exercise | null;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  equipment: EquipmentFilter;
  muscleGroup: MuscleGroupFilter;
  onEquipmentChange: (value: EquipmentFilter) => void;
  onMuscleGroupChange: (value: MuscleGroupFilter) => void;
  onSelectExercise: (exercise: Exercise) => void;
  activeSets: WorkoutSet[];
  activeVolume: number;
  onAddSets: (sets: number, reps: number, weight: number) => void;
  onRemoveSet: (id: string) => void;
  entries: WorkoutSet[];
  plannedSets: PlannedSetsMap;
  onSelectRosterExercise: (exercise: Exercise) => void;
  onAddExercise: () => void;
  onFinish: () => void;
  started: boolean;
  onStartExercise: () => void;
  isLoggingSet: boolean;
  isResting: boolean;
  restSecondsRemaining: number;
  restDurationSeconds: number;
  onAdjustRestDuration: (delta: number) => void;
  onSkipRest: () => void;
  isRestPaused: boolean;
  onToggleRestPause: () => void;
  onResetRest: () => void;
  onPauseWorkout: () => void;
  onResumeWorkout: () => void;
  onRestartExercise: () => void;
  isRestartingExercise: boolean;
  onTerminateWorkout: () => void;
  isTerminating: boolean;
  isActiveExerciseComplete: boolean;
  hasNextExercise: boolean;
  onNextExercise: () => void;
  exercisesCompleted: number;
};

const PHASE_LABEL: Record<WorkoutPhase, string> = {
  NOT_STARTED: 'Not started',
  ACTIVE: 'Active',
  RESTING: 'Resting',
  MANUALLY_PAUSED: 'Paused',
  COMPLETED: 'Complete',
};

export default function ActiveWorkout({
  workoutName,
  elapsedLabel,
  phase,
  exercises,
  activeExercise,
  pickerOpen,
  onTogglePicker,
  equipment,
  muscleGroup,
  onEquipmentChange,
  onMuscleGroupChange,
  onSelectExercise,
  activeSets,
  activeVolume,
  onAddSets,
  onRemoveSet,
  entries,
  plannedSets,
  onSelectRosterExercise,
  onAddExercise,
  onFinish,
  started,
  onStartExercise,
  isLoggingSet,
  isResting,
  restSecondsRemaining,
  restDurationSeconds,
  onAdjustRestDuration,
  onSkipRest,
  isRestPaused,
  onToggleRestPause,
  onResetRest,
  onPauseWorkout,
  onResumeWorkout,
  onRestartExercise,
  isRestartingExercise,
  onTerminateWorkout,
  isTerminating,
  isActiveExerciseComplete,
  hasNextExercise,
  onNextExercise,
  exercisesCompleted,
}: ActiveWorkoutProps) {
  const totalExercises = exercises.length;
  const progressPct = totalExercises > 0 ? Math.round((exercisesCompleted / totalExercises) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700 tracking-tight text-ink-900 sm:text-3xl">
            {workoutName}
          </h1>
          <span className="chip mt-2 w-fit border-energy-300/60 bg-energy-50 text-energy-800">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-energy-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-energy-500" />
            </span>
            {PHASE_LABEL[phase]}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 shadow-soft">
            <Timer className="h-4.5 w-4.5 text-ink-400" strokeWidth={2} />
            <span className="font-display text-xl font-700 tabular-nums text-ink-900 sm:text-2xl">{elapsedLabel}</span>
          </div>
          {phase === 'ACTIVE' && (
            <button
              type="button"
              onClick={onPauseWorkout}
              className="btn-warning px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
            >
              <Pause className="h-4 w-4" />
              Pause Workout
            </button>
          )}
          {phase === 'MANUALLY_PAUSED' && (
            <button
              type="button"
              onClick={onResumeWorkout}
              className="btn-accent px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
            >
              <Play className="h-4 w-4" />
              Resume Workout
            </button>
          )}
          <button
            type="button"
            onClick={onRestartExercise}
            disabled={isRestartingExercise || activeSets.length === 0}
            className="btn-outline px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Exercise
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="btn-primary px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
          >
            <Flag className="h-4 w-4" />
            Finish Workout
          </button>
          <button
            type="button"
            onClick={onTerminateWorkout}
            disabled={isTerminating}
            className="btn-danger px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base"
          >
            <XCircle className="h-4 w-4" />
            Cancel Workout
          </button>
        </div>
      </div>

      {totalExercises > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Progress</span>
            <span className="font-semibold text-ink-900">{exercisesCompleted} / {totalExercises} exercises completed</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-energy-400 transition-[width] duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExerciseSessionCard
            selectedExercise={activeExercise}
            pickerOpen={pickerOpen}
            onTogglePicker={onTogglePicker}
            equipment={equipment}
            muscleGroup={muscleGroup}
            onEquipmentChange={onEquipmentChange}
            onMuscleGroupChange={onMuscleGroupChange}
            onSelectExercise={onSelectExercise}
            sets={activeSets}
            exerciseVolume={activeVolume}
            onAddSets={onAddSets}
            onRemoveSet={onRemoveSet}
            started={started}
            onStartExercise={onStartExercise}
            plannedSets={activeExercise ? plannedSets[activeExercise.id] : undefined}
            isComplete={isActiveExerciseComplete}
            hasNextExercise={hasNextExercise}
            onNextExercise={onNextExercise}
            isLoggingSet={isLoggingSet}
          />
        </div>
        <RestTimer
          isResting={isResting}
          secondsRemaining={restSecondsRemaining}
          durationSeconds={restDurationSeconds}
          onAdjustDuration={onAdjustRestDuration}
          onSkipRest={onSkipRest}
          isRestPaused={isRestPaused}
          onTogglePause={onToggleRestPause}
          onResetRest={onResetRest}
        />
      </div>

      <WorkoutExerciseList
        exercises={exercises}
        activeExerciseId={activeExercise?.id ?? null}
        entries={entries}
        plannedSets={plannedSets}
        onSelect={onSelectRosterExercise}
        onAddExercise={onAddExercise}
      />
    </div>
  );
}
