import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, PlayCircle, Sparkles } from 'lucide-react';

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
};

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-energy-400/20 blur-3xl" />
        <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute right-1/3 -bottom-24 h-56 w-56 rounded-full bg-coral-400/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8 lg:py-10"
      >
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-energy-400">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Today's training
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-300">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip relative w-fit overflow-visible border-white/10 bg-white/5 text-energy-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-energy-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-energy-400" />
            </span>
            Ready to log
          </span>
          <Link to="/workout" className="btn-accent">
            <PlayCircle className="h-4 w-4" />
            Start workout
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
