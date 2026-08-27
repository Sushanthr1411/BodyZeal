import { Check } from 'lucide-react';
import type { Exercise } from '@/types/workout';

type ExerciseCardProps = {
  exercise: Exercise;
  selected: boolean;
  onSelect: () => void;
};

export default function ExerciseCard({ exercise, selected, onSelect }: ExerciseCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
        selected
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{exercise.name}</span>
        <span className={`block truncate text-xs ${selected ? 'text-ink-300' : 'text-ink-500'}`}>
          {exercise.equipment} • {exercise.muscleGroup}
        </span>
      </span>
      {selected && (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-energy-400 text-ink-950">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
