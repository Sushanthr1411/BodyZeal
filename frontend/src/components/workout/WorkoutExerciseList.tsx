import { CheckCircle2, Circle, ListChecks, Plus } from 'lucide-react';
import type { Exercise } from '@/types/workout';

type WorkoutExerciseListProps = {
  exercises: Exercise[];
  activeExerciseId: string | null;
  setCounts: Record<string, number>;
  onSelect: (exercise: Exercise) => void;
  onAddExercise: () => void;
};

export default function WorkoutExerciseList({
  exercises,
  activeExerciseId,
  setCounts,
  onSelect,
  onAddExercise,
}: WorkoutExerciseListProps) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <ListChecks className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Workout Exercises</p>
      </div>

      {exercises.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">No exercises added yet.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {exercises.map((exercise) => {
            const count = setCounts[exercise.name] ?? 0;
            const active = exercise.id === activeExerciseId;
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  active ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {count > 0 ? (
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${active ? 'text-energy-400' : 'text-energy-600'}`} />
                  ) : (
                    <Circle className={`h-4 w-4 shrink-0 ${active ? 'text-ink-300' : 'text-ink-300'}`} />
                  )}
                  <span className="truncate font-medium">{exercise.name}</span>
                </span>
                <span className={`shrink-0 text-xs ${active ? 'text-ink-300' : 'text-ink-500'}`}>
                  {count} {count === 1 ? 'set' : 'sets'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onAddExercise}
        className="btn-outline mt-4 w-full"
      >
        <Plus className="h-4 w-4" />
        Add Exercise
      </button>
    </div>
  );
}
