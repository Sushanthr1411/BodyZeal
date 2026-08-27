import { Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Timer, CalendarCheck, History } from 'lucide-react';
import Brand from '@/components/Brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form side */}
      <div className="flex flex-col bg-ink-50">
        <div className="flex items-center justify-between p-6 sm:p-8">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Brand />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Right: visual side */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-energy-400/15 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-energy-400/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center p-12 xl:p-16">
          <span className="chip w-fit border-ink-700 bg-ink-800 text-energy-400">
            <span className="h-1.5 w-1.5 rounded-full bg-energy-400" />
            Built for consistency
          </span>
          <h2 className="mt-6 font-display text-4xl font-700 leading-tight tracking-tight text-white xl:text-5xl">
            Your training,
            <br />
            <span className="text-energy-400">organized and clear.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-ink-300">
            Log sets, track volume, and review your history. Everything you need
            to stay on top of your workouts.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              { icon: Dumbbell, text: 'Record exercises, sets, reps, and weight' },
              { icon: History, text: 'Review workouts grouped by date' },
              { icon: CalendarCheck, text: 'See today\u2019s exercise summary at a glance' },
              { icon: Timer, text: 'Manage rest with a countdown timer' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-ink-200">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-800 text-energy-400">
                  <item.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
