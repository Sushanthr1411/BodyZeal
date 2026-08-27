import { Check, ListChecks, Trash2 } from 'lucide-react';
import type { WorkoutSet } from '@/types/workout';
import EmptyState from '@/components/common/EmptyState';

type CompletedSetsProps = {
  sets: WorkoutSet[];
  onRemove: (id: string) => void;
  /** Target number of sets for this exercise, if it came from a routine. Renders remaining slots as ○ placeholders. */
  plannedSets?: number;
};

export default function CompletedSets({ sets, onRemove, plannedSets }: CompletedSetsProps) {
  if (sets.length === 0 && !plannedSets) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No sets logged yet"
        description="Enter your reps and weight above, then Add Set."
      />
    );
  }

  const remaining = plannedSets ? Math.max(0, plannedSets - sets.length) : 0;

  return (
    <div className="space-y-2">
      {sets.map((set, index) => (
        <div key={set.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-energy-50 text-energy-600">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <p className="text-sm font-medium text-ink-900">
              Set {index + 1} · {set.reps} reps × {set.weight} kg
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-ink-900">{set.volume.toLocaleString()} kg</p>
            <button
              type="button"
              onClick={() => onRemove(set.id)}
              className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-red-600"
              aria-label={`Remove set ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {Array.from({ length: remaining }, (_, i) => (
        <div
          key={`planned-${i}`}
          className="flex items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/40 p-3"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-700 text-ink-400">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-ink-300" />
          </span>
          <p className="text-sm text-ink-400">Set {sets.length + i + 1} · not logged yet</p>
        </div>
      ))}
    </div>
  );
}
