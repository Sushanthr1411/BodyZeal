import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, PlayCircle, PlusCircle, Sparkles } from 'lucide-react';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up training?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Late-night session?';
}

type DashboardHeaderProps = {
  firstName?: string;
  hasLoggedToday?: boolean;
};

export default function DashboardHeader({ firstName, hasLoggedToday }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-energy-400/20 blur-3xl" />
        <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:py-6"
      >
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-energy-400">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Today's training
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-ink-300">
              <Calendar className="h-3.5 w-3.5" />
              {today}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip relative w-fit overflow-visible border-white/10 bg-white/5 text-energy-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-energy-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-energy-400" />
            </span>
            {hasLoggedToday ? 'In progress' : 'Ready to log'}
          </span>
          <Link
            to="/workout/new"
            title="Create a routine"
            aria-label="Create a routine"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <PlusCircle className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>
          <Link to="/workout" className="btn-accent">
            <PlayCircle className="h-4 w-4" />
            Start workout
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
