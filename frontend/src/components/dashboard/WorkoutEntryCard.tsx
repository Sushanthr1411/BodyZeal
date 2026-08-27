import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, AlertCircle, Check } from 'lucide-react';
import type { Exercise, WorkoutSet } from '@/types/workout';
import { calcVolume } from '@/utils/workout';
import { EXERCISES } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, filterExercises, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import ExercisePickerPopover from '@/components/dashboard/ExercisePickerPopover';

export default function WorkoutEntryCard({ onAdd }: { onAdd: (entry: WorkoutSet) => void }) {
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [justAdded, setJustAdded] = useState(false);

  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);
  const exerciseName = selectedExercise?.name ?? '';

  function handleSelectExercise(exercise: Exercise) {
    setSelectedExercise(exercise);
    setErrors((current) => ({ ...current, exercise: '' }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    const parsedSets = Number(sets);
    const parsedReps = Number(reps);
    const parsedWeight = Number(weight);
    if (!exerciseName) next.exercise = 'Select an exercise.';
    if (!sets || !Number.isInteger(parsedSets) || parsedSets <= 0) next.sets = 'Enter positive whole sets.';
    if (!reps || !Number.isInteger(parsedReps) || parsedReps <= 0) next.reps = 'Enter positive whole reps.';
    if (!weight || Number.isNaN(parsedWeight) || parsedWeight <= 0) next.weight = 'Enter a positive weight.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({
      id: crypto.randomUUID(),
      exerciseName,
      sets: parsedSets,
      reps: parsedReps,
      weight: parsedWeight,
      volume: calcVolume(parsedSets, parsedReps, parsedWeight),
      loggedAt: new Date().toISOString(),
    });
    setSets(''); setReps(''); setWeight(''); setErrors({});
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  const fields = [
    { label: 'Sets', value: sets, setter: setSets, key: 'sets' },
    { label: 'Reps', value: reps, setter: setReps, key: 'reps' },
    { label: 'Weight (kg)', value: weight, setter: setWeight, key: 'weight' },
  ] as const;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <Dumbbell className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Log a Set</p>
            <p className="truncate text-xs text-ink-500">Pick an exercise, then log the work</p>
          </div>
        </div>
        <motion.span
          animate={justAdded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          className="chip shrink-0 border-energy-300/60 bg-energy-50 text-[11px] text-energy-800"
        >
          <Check className="h-3 w-3" />
          Set added
        </motion.span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <ExercisePickerPopover
            exercises={visibleExercises}
            selectedExercise={selectedExercise}
            equipment={equipment}
            muscleGroup={muscleGroup}
            onEquipmentChange={setEquipment}
            onMuscleGroupChange={setMuscleGroup}
            onSelect={handleSelectExercise}
          />
          {errors.exercise && <ErrorMessage message={errors.exercise} />}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-start">
          <div className="grid grid-cols-3 gap-2 sm:col-span-9 sm:gap-3">
            {fields.map(({ label, value, setter, key }) => (
              <div key={key}>
                <label htmlFor={key} className="label">{label}</label>
                <input
                  id={key}
                  type="number"
                  min="0"
                  step={key === 'weight' ? '0.1' : '1'}
                  placeholder="0"
                  value={value}
                  onChange={(event) => { setter(event.target.value); setErrors((current) => ({ ...current, [key]: '' })); }}
                  className={`input ${errors[key] ? 'border-red-400 focus:border-red-400' : ''}`}
                  aria-invalid={!!errors[key]}
                />
                {errors[key] && <ErrorMessage message={errors[key]} />}
              </div>
            ))}
          </div>

          <div className="sm:col-span-3">
            <span className="label hidden sm:block">&nbsp;</span>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-accent w-full">
              <Plus className="h-4 w-4" />
              Add set
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />{message}</p>;
}
