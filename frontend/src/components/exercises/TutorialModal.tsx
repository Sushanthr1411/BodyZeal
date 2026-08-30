import { Lightbulb, ListOrdered, X } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import type { ExerciseTutorial } from '@/data/exerciseTutorials';

type TutorialModalProps = {
  open: boolean;
  onClose: () => void;
  exercise: Exercise;
  tutorial: ExerciseTutorial;
};

export default function TutorialModal({ open, onClose, exercise, tutorial }: TutorialModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="card relative w-full max-w-lg animate-scale-in p-6 max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-900"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <ListOrdered className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink-900">{exercise.name}</h2>
        <p className="mt-1 text-sm text-ink-500">Step-by-step form guide</p>

        <ol className="mt-5 space-y-3">
          {tutorial.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-700">{step}</p>
            </li>
          ))}
        </ol>

        {tutorial.tips && tutorial.tips.length > 0 && (
          <div className="mt-5 rounded-xl bg-energy-50/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-energy-700">
              <Lightbulb className="h-3.5 w-3.5" />
              Coaching tips
            </div>
            <ul className="mt-2 space-y-1.5">
              {tutorial.tips.map((tip, index) => (
                <li key={index} className="text-sm text-ink-700">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" onClick={onClose} className="btn-outline mt-6 w-full">
          Got it
        </button>
      </div>
    </div>
  );
}
