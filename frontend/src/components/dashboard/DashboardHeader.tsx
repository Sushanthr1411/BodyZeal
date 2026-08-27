import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up training?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Late-night session?';
}

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden border-b border-ink-200/70 bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-energy-400/15 blur-3xl" />
        <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute right-1/3 -bottom-24 h-56 w-56 rounded-full bg-coral-400/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:py-8"
      >
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-energy-700">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting()}
          </p>
          <h1 className="mt-1 font-display text-2xl font-700 tracking-tight text-ink-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
        </div>
        <span className="chip relative w-fit overflow-visible border-energy-300/60 bg-energy-50 text-energy-800">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-energy-500" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-energy-500" />
          </span>
          Ready to log
        </span>
      </motion.div>
    </div>
  );
}
