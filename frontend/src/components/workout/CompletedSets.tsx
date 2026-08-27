import { ListChecks, Trash2 } from 'lucide-react';
import type { WorkoutSet } from '@/types/workout';
import EmptyState from '@/components/common/EmptyState';

type CompletedSetsProps = {
  sets: WorkoutSet[];
  onRemove: (id: string) => void;
};

export default function CompletedSets({ sets, onRemove }: CompletedSetsProps) {
  if (sets.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No sets logged yet"
        description="Enter your reps and weight above, then Add Set."
      />
    );
  }

  return (
    <div className="space-y-2">
      {sets.map((set, index) => (
        <div key={set.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-700 text-ink-700">
              {index + 1}
            </span>
            <p className="text-sm font-medium text-ink-900">
              {set.reps} reps × {set.weight} kg
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
    </div>
  );
}
