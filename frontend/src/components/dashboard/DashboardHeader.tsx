import { Calendar } from 'lucide-react';

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 border-b border-ink-200/70 bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 tracking-tight text-ink-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
        </div>
        <span className="chip w-fit border-energy-300/60 bg-energy-50 text-energy-800">
          <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
          Ready to log
        </span>
      </div>
    </div>
  );
}
