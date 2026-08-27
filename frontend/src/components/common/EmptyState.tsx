import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink-300 shadow-soft">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="mt-4 font-medium text-ink-700">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-ink-500">{description}</p>
    </div>
  );
}
