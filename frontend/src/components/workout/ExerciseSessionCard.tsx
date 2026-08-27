import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Dumbbell, Pencil, Plus, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
  started: boolean;
  onStartExercise: () => void;
  plannedSets?: number;
  isComplete: boolean;
  hasNextExercise: boolean;
  onNextExercise: () => void;
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
  started,
  onStartExercise,
  plannedSets,
  isComplete,
  hasNextExercise,
  onNextExercise,
}: ExerciseSessionCardProps) {
  const [showExtraSetForm, setShowExtraSetForm] = useState(false);

  useEffect(() => {
    setShowExtraSetForm(false);
  }, [selectedExercise?.id]);
  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);
  const showPicker = pickerOpen || !selectedExercise;

  return (
    <div className="card relative p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-energy-400/10 blur-3xl" />
      </div>
      <div className="relative flex items-start justify-between gap-3">
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

      {selectedExercise && !showPicker && !started && (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-4 py-7 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-energy-400">
            <PlayCircle className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Ready for {selectedExercise.name}?</p>
            <p className="mt-0.5 text-xs text-ink-500">Start the exercise to begin logging sets.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onStartExercise}
            className="btn-accent px-5"
          >
            <PlayCircle className="h-4 w-4" />
            Start Exercise
          </motion.button>
        </div>
      )}

      {selectedExercise && !showPicker && started && (
        <div className="mt-5 space-y-5">
          {isComplete && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-energy-50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-energy-800">
                <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2} />
                Exercise Complete
              </span>
              {hasNextExercise && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onNextExercise}
                  className="btn-accent px-4 py-2 text-sm"
                >
                  Next Exercise
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          )}

          {(!isComplete || showExtraSetForm) && <SetEntryForm onAddSets={onAddSets} />}

          {isComplete && !showExtraSetForm && (
            <button
              type="button"
              onClick={() => setShowExtraSetForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900"
            >
              <Plus className="h-3.5 w-3.5" />
              Log an extra set
            </button>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Sets</p>
              {sets.length > 0 && (
                <p className="text-xs font-medium text-ink-600">
                  Exercise volume: <span className="font-semibold text-ink-900">{exerciseVolume.toLocaleString()} kg</span>
                </p>
              )}
            </div>
            <CompletedSets sets={sets} onRemove={onRemoveSet} plannedSets={plannedSets} />
          </div>
        </div>
      )}
    </div>
  );
}
