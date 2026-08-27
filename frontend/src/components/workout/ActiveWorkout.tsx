import { Flag } from 'lucide-react';
import type { Exercise, WorkoutSet } from '@/types/workout';
import type { EquipmentFilter, MuscleGroupFilter } from '@/utils/exercises';
import ExerciseSessionCard from '@/components/workout/ExerciseSessionCard';
import RestTimer from '@/components/workout/RestTimer';
import WorkoutExerciseList from '@/components/workout/WorkoutExerciseList';

type ActiveWorkoutProps = {
  workoutName: string;
  elapsedLabel: string;
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
  setCounts: Record<string, number>;
  onSelectRosterExercise: (exercise: Exercise) => void;
  onAddExercise: () => void;
  onFinish: () => void;
};

export default function ActiveWorkout({
  workoutName,
  elapsedLabel,
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
  setCounts,
  onSelectRosterExercise,
  onAddExercise,
  onFinish,
}: ActiveWorkoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700 tracking-tight text-ink-900 sm:text-3xl">
            {workoutName}
          </h1>
          <span className="chip mt-2 w-fit border-energy-300/60 bg-energy-50 text-energy-800">
            <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
            Active • {elapsedLabel}
          </span>
        </div>
        <button type="button" onClick={onFinish} className="btn-primary">
          <Flag className="h-4 w-4" />
          Finish Workout
        </button>
      </div>

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
          />
        </div>
        <RestTimer />
      </div>

      <WorkoutExerciseList
        exercises={exercises}
        activeExerciseId={activeExercise?.id ?? null}
        setCounts={setCounts}
        onSelect={onSelectRosterExercise}
        onAddExercise={onAddExercise}
      />
    </div>
  );
}
