import { SearchX } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import EmptyState from '@/components/common/EmptyState';

type ExerciseListProps = {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (exercise: Exercise) => void;
  variant?: 'compact' | 'grid';
};

export default function ExerciseList({ exercises, selectedId, onSelect, variant = 'grid' }: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No exercises found for this combination."
        description="Try changing the equipment or muscle group."
      />
    );
  }

  if (variant === 'compact') {
    return (
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            selected={exercise.id === selectedId}
            onSelect={() => onSelect(exercise)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          selected={exercise.id === selectedId}
          onSelect={() => onSelect(exercise)}
        />
      ))}
    </div>
  );
}
