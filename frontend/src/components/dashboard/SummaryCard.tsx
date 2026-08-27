import { CalendarCheck } from 'lucide-react';

export default function SummaryCard({ exerciseCount }: { exerciseCount: number }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-50 text-energy-600">
            <CalendarCheck className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Daily Summary</p>
            <p className="text-xs text-ink-500">Today's exercise count</p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <p className="font-display text-4xl font-700 text-ink-900">{exerciseCount}</p>
        <p className="mt-1 text-sm text-ink-500">exercises completed today</p>
      </div>
      <div className="mt-4 rounded-lg bg-ink-50 px-3 py-2.5">
        <p className="text-xs text-ink-500">
          {exerciseCount === 0 ? 'Start logging to see today\'s total update here.' : 'Exercises logged today.'}
        </p>
      </div>
    </div>
  );
}
