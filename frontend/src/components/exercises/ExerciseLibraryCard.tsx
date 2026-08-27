import { motion } from 'framer-motion';
import { ChevronRight, Dumbbell } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import { muscleGroupAccent } from '@/utils/muscleGroupColor';

type ExerciseLibraryCardProps = {
  exercise: Exercise;
  onSelect: () => void;
};

export default function ExerciseLibraryCard({ exercise, onSelect }: ExerciseLibraryCardProps) {
  const accent = muscleGroupAccent(exercise.muscleGroup);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-full items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-left shadow-soft transition-shadow hover:border-ink-300 hover:shadow-lift"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent.badge}`}>
        <Dumbbell className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{exercise.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${accent.chip}`}>{exercise.muscleGroup}</span>
          <span className="chip border-ink-200 bg-ink-50 text-ink-600">{exercise.equipment}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500" />
    </motion.button>
  );
}
