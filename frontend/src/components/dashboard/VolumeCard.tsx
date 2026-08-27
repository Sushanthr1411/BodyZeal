import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import AnimatedNumber from '@/components/common/AnimatedNumber';

export default function VolumeCard({ totalVolume }: { totalVolume: number }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="card relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/10 blur-2xl" />
      <div className="relative flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
          <Calculator className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">Volume</p>
          <p className="text-xs text-ink-500">Sets × Reps × Weight</p>
        </div>
      </div>
      <div className="relative mt-5">
        <p className="font-display text-4xl font-700 text-ink-900">
          <AnimatedNumber value={totalVolume} />
        </p>
        <p className="mt-1 text-sm text-ink-500">kg total volume today</p>
      </div>
      <div className="relative mt-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5">
        <span className="font-mono text-xs text-ink-500">
          Volume = Sets × Reps × Weight
        </span>
      </div>
    </motion.div>
  );
}
