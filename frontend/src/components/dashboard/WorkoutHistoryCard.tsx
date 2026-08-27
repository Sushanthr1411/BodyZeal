import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Trash2, ArrowRight } from 'lucide-react';
import type { WorkoutSet } from '@/types/workout';
import { formatTime } from '@/utils/workout';
import EmptyState from '@/components/common/EmptyState';

export default function WorkoutHistoryCard({ entries, onRemove }: { entries: WorkoutSet[]; onRemove: (id: string) => void }) {
  const ordered = entries.slice().reverse();

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-aqua-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-energy-50 text-energy-600">
            <History className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Today's Activity</p>
            <p className="truncate text-xs text-ink-500">Sets logged in this session</p>
          </div>
        </div>
        <Link
          to="/history"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink-500 transition-colors hover:text-ink-900"
        >
          Full history
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={History}
            title="No sets logged yet"
            description="Add your first set above — it will show up here right away."
          />
        </div>
      ) : (
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {ordered.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{entry.exerciseName}</p>
                  <p className="text-xs text-ink-500">
                    {entry.sets} sets × {entry.reps} reps × {entry.weight} kg · {formatTime(new Date(entry.loggedAt).getHours() * 3600 + new Date(entry.loggedAt).getMinutes() * 60 + new Date(entry.loggedAt).getSeconds())}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-ink-900">{entry.volume.toLocaleString()} kg</p>
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
