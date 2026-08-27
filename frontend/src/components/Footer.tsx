import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-200/60 bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-energy-400">
              <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-sm font-700 tracking-tight text-ink-900">
              Fitness &amp; Workout Log
            </span>
          </div>
          <p className="text-sm text-ink-500">
            Track every set. Build every day.
          </p>
        </div>
        <div className="mt-8 border-t border-ink-200/60 pt-6">
          <p className="text-xs text-ink-400">
            &copy; {new Date().getFullYear()} Fitness &amp; Workout Log. A focused workout logging app.
          </p>
          <div className="mt-3 flex gap-4 text-xs text-ink-500">
            <Link to="/" className="hover:text-ink-800">Home</Link>
            <Link to="/login" className="hover:text-ink-800">Log in</Link>
            <Link to="/dashboard" className="hover:text-ink-800">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
