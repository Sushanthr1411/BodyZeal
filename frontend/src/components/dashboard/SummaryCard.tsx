import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import AnimatedNumber from '@/components/common/AnimatedNumber';

export default function SummaryCard({ exerciseCount }: { exerciseCount: number }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="card relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-aqua-400/10 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-aqua-50 text-aqua-600">
            <CalendarCheck className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Daily Summary</p>
            <p className="text-xs text-ink-500">Today's exercise count</p>
          </div>
        </div>
      </div>
      <div className="relative mt-5">
        <p className="font-display text-4xl font-700 text-ink-900">
          <AnimatedNumber value={exerciseCount} />
        </p>
        <p className="mt-1 text-sm text-ink-500">exercises completed today</p>
      </div>
      <div className="relative mt-4 rounded-lg bg-ink-50 px-3 py-2.5">
        <p className="text-xs text-ink-500">
          {exerciseCount === 0 ? 'Start logging to see today\'s total update here.' : 'Exercises logged today.'}
        </p>
      </div>
    </motion.div>
  );
}
