import { AlertCircle, Check } from 'lucide-react';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  type ExperienceLevel,
  type FitnessGoal,
  type UserProfile,
} from '@/types/profile';
import type { FitnessProfileErrors } from '@/components/onboarding/validation';

type FitnessProfileStepProps = {
  data: Pick<UserProfile, 'fitnessGoal' | 'experienceLevel'>;
  errors: FitnessProfileErrors;
  onChange: (patch: Partial<UserProfile>) => void;
};

export default function FitnessProfileStep({ data, errors, onChange }: FitnessProfileStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-700 tracking-tight text-ink-900">
          What are you training for?
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          This helps shape your BodyZeal experience.
        </p>
      </div>

      <div>
        <span className="label">Fitness Goal</span>
        <div className="space-y-2">
          {FITNESS_GOAL_OPTIONS.map((option) => (
            <SelectCard
              key={option.value}
              label={option.label}
              description={option.description}
              selected={data.fitnessGoal === option.value}
              onSelect={() => onChange({ fitnessGoal: option.value as FitnessGoal })}
            />
          ))}
        </div>
        {errors.fitnessGoal && <ErrorMessage id="fitnessGoal-error" message={errors.fitnessGoal} />}
      </div>

      <div>
        <span className="label">Experience Level</span>
        <div className="space-y-2">
          {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
            <SelectCard
              key={option.value}
              label={option.label}
              description={option.description}
              selected={data.experienceLevel === option.value}
              onSelect={() => onChange({ experienceLevel: option.value as ExperienceLevel })}
            />
          ))}
        </div>
        {errors.experienceLevel && (
          <ErrorMessage id="experienceLevel-error" message={errors.experienceLevel} />
        )}
      </div>
    </div>
  );
}

function SelectCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className={`block text-xs ${selected ? 'text-ink-300' : 'text-ink-500'}`}>
          {description}
        </span>
      </span>
      {selected && (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-energy-400 text-ink-950">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function ErrorMessage({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}
