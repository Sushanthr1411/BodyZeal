import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

type SetEntryFormProps = {
  onAddSets: (sets: number, reps: number, weight: number) => void;
  disabled?: boolean;
};

export default function SetEntryForm({ onAddSets, disabled }: SetEntryFormProps) {
  const [sets, setSets] = useState('1');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const parsedSets = Number(sets);
    const parsedReps = Number(reps);
    const parsedWeight = Number(weight);
    const next: Record<string, string> = {};
    if (!sets || !Number.isInteger(parsedSets) || parsedSets <= 0) next.sets = 'Enter positive whole sets.';
    if (!reps || !Number.isInteger(parsedReps) || parsedReps <= 0) next.reps = 'Enter positive whole reps.';
    if (!weight || Number.isNaN(parsedWeight) || parsedWeight <= 0) next.weight = 'Enter a positive weight.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAddSets(parsedSets, parsedReps, parsedWeight);
    setSets('1'); setReps(''); setWeight(''); setErrors({});
  }

  const fields = [
    { label: 'Sets', value: sets, setter: setSets, key: 'sets' },
    { label: 'Reps', value: reps, setter: setReps, key: 'reps' },
    { label: 'Weight (kg)', value: weight, setter: setWeight, key: 'weight' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4 sm:items-start" noValidate>
      {fields.map(({ label, value, setter, key }) => (
        <div key={key}>
          <label htmlFor={`session-${key}`} className="label">{label}</label>
          <input
            id={`session-${key}`}
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
      <div>
        <span className="label hidden sm:block">&nbsp;</span>
        <button type="submit" disabled={disabled} className="btn-accent w-full disabled:cursor-not-allowed disabled:opacity-60">
          <Plus className="h-4 w-4" />
          Add Set
        </button>
      </div>
    </form>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />{message}</p>;
}
