import { Dumbbell } from 'lucide-react';

interface BrandProps {
  className?: string;
  variant?: 'default' | 'light';
}

export default function Brand({ className = '' }: BrandProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-energy-400 shadow-soft">
        <Dumbbell className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-700 tracking-tight text-ink-900">
        Body<span className="text-energy-500">Zeal</span>
      </span>
    </span>
  );
}
