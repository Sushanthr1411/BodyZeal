import { Dumbbell, Plus, ChevronDown } from 'lucide-react';

export default function WorkoutEntryCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
            <Dumbbell className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Log a Set</p>
            <p className="text-xs text-ink-500">Exercise, sets, reps, weight</p>
          </div>
        </div>
        <span className="chip text-[10px]">Coming soon</span>
      </div>

      {/* Placeholder form fields */}
      <div className="mt-5 space-y-4">
        <div>
          <label className="label">Exercise</label>
          <div className="relative">
            <select
              disabled
              className="input cursor-not-allowed appearance-none pr-10 opacity-60"
              aria-label="Exercise selection (coming soon)"
            >
              <option>Select an exercise...</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['Sets', 'Reps', 'Weight (kg)'].map((field) => (
            <div key={field}>
              <label className="label">{field}</label>
              <input
                disabled
                type="number"
                placeholder="—"
                className="input cursor-not-allowed opacity-60"
                aria-label={`${field} (coming soon)`}
              />
            </div>
          ))}
        </div>

        <button
          disabled
          className="btn w-full cursor-not-allowed bg-ink-100 text-ink-400"
        >
          <Plus className="h-4 w-4" />
          Add set
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Workout logging will be available here in the next stage.
      </p>
    </div>
  );
}
