import { History, Trash2 } from 'lucide-react';
import type { WorkoutSet } from '@/types/workout';
import { formatTime } from '@/utils/workout';

export default function WorkoutHistoryCard({ entries, onRemove }: { entries: WorkoutSet[]; onRemove: (id: string) => void }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-50 text-energy-600">
            <History className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Workout History</p>
            <p className="text-xs text-ink-500">Grouped by date, sorted chronologically</p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink-300 shadow-soft">
          <History className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 font-medium text-ink-700">No workout logged yet</p>
        <p className="mt-1 max-w-xs text-sm text-ink-500">
          Your logged sets will appear here, grouped by date. Start by adding your
          first exercise.
        </p>
      </div> : <div className="mt-6 space-y-2">
        {entries.slice().reverse().map((entry) => <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink-900">{entry.exerciseName}</p><p className="text-xs text-ink-500">{entry.sets} sets × {entry.reps} reps × {entry.weight} kg · {formatTime(new Date(entry.loggedAt).getHours() * 3600 + new Date(entry.loggedAt).getMinutes() * 60 + new Date(entry.loggedAt).getSeconds())}</p></div>
          <div className="text-right"><p className="text-sm font-semibold text-ink-900">{entry.volume.toLocaleString()} kg</p><button type="button" onClick={() => onRemove(entry.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-red-600"><Trash2 className="h-3 w-3" />Remove Set</button></div>
        </div>)}
      </div>}
    </div>
  );
}
