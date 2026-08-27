import { Dumbbell, Pencil } from 'lucide-react';
import type { Exercise, WorkoutSet } from '@/types/workout';
import { EXERCISES } from '@/data/exercises';
import { filterExercises, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseList from '@/components/exercises/ExerciseList';
import SetEntryForm from '@/components/workout/SetEntryForm';
import CompletedSets from '@/components/workout/CompletedSets';

type ExerciseSessionCardProps = {
  selectedExercise: Exercise | null;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  equipment: EquipmentFilter;
  muscleGroup: MuscleGroupFilter;
  onEquipmentChange: (value: EquipmentFilter) => void;
  onMuscleGroupChange: (value: MuscleGroupFilter) => void;
  onSelectExercise: (exercise: Exercise) => void;
  sets: WorkoutSet[];
  exerciseVolume: number;
  onAddSets: (sets: number, reps: number, weight: number) => void;
  onRemoveSet: (id: string) => void;
};

export default function ExerciseSessionCard({
  selectedExercise,
  pickerOpen,
  onTogglePicker,
  equipment,
  muscleGroup,
  onEquipmentChange,
  onMuscleGroupChange,
  onSelectExercise,
  sets,
  exerciseVolume,
  onAddSets,
  onRemoveSet,
}: ExerciseSessionCardProps) {
  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);
  const showPicker = pickerOpen || !selectedExercise;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <Dumbbell className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Current Exercise</p>
            <p className="text-base font-semibold text-ink-900">
              {selectedExercise ? selectedExercise.name : 'Choose an exercise'}
            </p>
            {selectedExercise && (
              <p className="text-xs text-ink-500">
                {selectedExercise.equipment} • {selectedExercise.muscleGroup}
              </p>
            )}
          </div>
        </div>
        {selectedExercise && (
          <button
            type="button"
            onClick={onTogglePicker}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            {showPicker ? 'Close' : 'Change'}
          </button>
        )}
      </div>

      {showPicker && (
        <div className="mt-5 rounded-xl border border-ink-200 bg-ink-50/40 p-4">
          <ExerciseFilters
            equipment={equipment}
            muscleGroup={muscleGroup}
            onEquipmentChange={onEquipmentChange}
            onMuscleGroupChange={onMuscleGroupChange}
          />
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
              Available Exercises
            </p>
            <ExerciseList
              exercises={visibleExercises}
              selectedId={selectedExercise?.id ?? null}
              onSelect={onSelectExercise}
              variant="compact"
            />
          </div>
        </div>
      )}

      {selectedExercise && !showPicker && (
        <div className="mt-5 space-y-5">
          <SetEntryForm onAddSets={onAddSets} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Completed Sets</p>
              {sets.length > 0 && (
                <p className="text-xs font-medium text-ink-600">
                  Exercise volume: <span className="font-semibold text-ink-900">{exerciseVolume.toLocaleString()} kg</span>
                </p>
              )}
            </div>
            <CompletedSets sets={sets} onRemove={onRemoveSet} />
          </div>
        </div>
      )}
    </div>
  );
}
