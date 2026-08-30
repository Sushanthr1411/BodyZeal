import { motion } from 'framer-motion';
import { Dumbbell, Sparkles } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import type { ExerciseStats } from '@/utils/analytics';
import { muscleGroupAccent } from '@/utils/muscleGroupColor';

type PersonalRecordCardProps = {
  exercise: Exercise;
  stats: ExerciseStats;
  isNew: boolean;
  onSelect: () => void;
};

/** One exercise's trophy-case summary: heaviest weight (the headline PR), best volume
 * session, and times trained. Clicking opens the full progress chart on Exercise Detail. */
export default function PersonalRecordCard({ exercise, stats, isNew, onSelect }: PersonalRecordCardProps) {
  const accent = muscleGroupAccent(exercise.muscleGroup);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 text-left shadow-soft transition-shadow hover:border-ink-300 hover:shadow-lift"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-energy-400/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent.badge}`}>
            <Dumbbell className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{exercise.name}</p>
            <span className={`chip mt-1 ${accent.chip}`}>{exercise.muscleGroup}</span>
          </div>
        </div>
        {isNew && (
          <span className="chip shrink-0 border-energy-400/60 bg-energy-400 text-[10px] text-ink-950">
            <Sparkles className="h-2.5 w-2.5" />
            New PR
          </span>
        )}
      </div>

      <div className="relative mt-4 rounded-xl bg-ink-50/70 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Heaviest weight</p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-900">
          {stats.bestWeight} <span className="text-base font-semibold text-ink-400">kg</span>
        </p>
        <p className="text-xs text-ink-500">× {stats.heaviestWeightRecord.reps} reps</p>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-violet-50/50 px-3 py-2">
          <p className="text-[10px] text-ink-500">Best set volume</p>
          <p className="text-sm font-semibold text-ink-900">{stats.bestSetVolume.toLocaleString()} kg</p>
        </div>
        <div className="rounded-lg bg-sky-50/50 px-3 py-2">
          <p className="text-[10px] text-ink-500">Times trained</p>
          <p className="text-sm font-semibold text-ink-900">{stats.timesPerformed}</p>
        </div>
      </div>
    </motion.button>
  );
}
