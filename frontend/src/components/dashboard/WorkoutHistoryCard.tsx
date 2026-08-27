import { History, Plus } from 'lucide-react';

export default function WorkoutHistoryCard() {
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

      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink-300 shadow-soft">
          <History className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 font-medium text-ink-700">No workouts logged yet</p>
        <p className="mt-1 max-w-xs text-sm text-ink-500">
          Your logged sets will appear here, grouped by date. Start by adding your
          first exercise.
        </p>
        <button
          disabled
          className="btn mt-5 cursor-not-allowed bg-ink-100 text-ink-400"
        >
          <Plus className="h-4 w-4" />
          Add your first exercise
        </button>
      </div>
    </div>
  );
}
