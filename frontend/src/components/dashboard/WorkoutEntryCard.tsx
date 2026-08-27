import { useState } from 'react';
import { Dumbbell, Plus, ChevronDown, AlertCircle } from 'lucide-react';
import type { WorkoutSet } from '@/types/workout';
import { calcVolume } from '@/utils/workout';

const EXERCISES = ['Squat', 'Bench Press', 'Pull-Up', 'Run'];

export default function WorkoutEntryCard({ onAdd }: { onAdd: (entry: WorkoutSet) => void }) {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  }

  const fields = [
    { label: 'Sets', value: sets, setter: setSets, key: 'sets' },
    { label: 'Reps', value: reps, setter: setReps, key: 'reps' },
    { label: 'Weight (kg)', value: weight, setter: setWeight, key: 'weight' },
  ] as const;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <Dumbbell className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Log a Set</p>
            <p className="text-xs text-ink-500">Exercise, sets, reps, weight</p>
          </div>
        </div>
        <span className="chip bg-energy-50 text-[10px] text-energy-800">Quick entry</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="exercise" className="label">Exercise</label>
          <div className="relative">
            <select
              id="exercise"
              value={exerciseName}
              onChange={(event) => { setExerciseName(event.target.value); setErrors((current) => ({ ...current, exercise: '' })); }}
              className="input appearance-none pr-10"
              aria-invalid={!!errors.exercise}
            >
              <option value="">Select an exercise...</option>
              {EXERCISES.map((exercise) => <option key={exercise}>{exercise}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>
          {errors.exercise && <ErrorMessage message={errors.exercise} />}
        </div>

        <div className="grid grid-cols-3 gap-3">
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

        <button type="submit" className="btn-accent w-full">
          <Plus className="h-4 w-4" />
          Add set
        </button>
      </form>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />{message}</p>;
}
