import { AlertCircle } from 'lucide-react';
import type { UserProfile } from '@/types/profile';
import type { BodyInformationErrors } from '@/components/onboarding/validation';

type BodyInformationStepProps = {
  data: Pick<UserProfile, 'height' | 'weight'>;
  errors: BodyInformationErrors;
  onChange: (patch: Partial<UserProfile>) => void;
};

export default function BodyInformationStep({ data, errors, onChange }: BodyInformationStepProps) {
  function handleNumberChange(field: 'height' | 'weight', raw: string) {
    if (raw.trim() === '') {
      onChange({ [field]: null });
      return;
    }
    const parsed = Number(raw);
    onChange({ [field]: Number.isNaN(parsed) ? null : parsed });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-700 tracking-tight text-ink-900">
          Tell us about your body
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          Used to tailor your training experience.
        </p>
      </div>

      <div>
        <label htmlFor="height" className="label">Height</label>
        <div className="relative">
          <input
            id="height"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            className={`input pr-14 ${errors.height ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
            placeholder="e.g. 175"
            value={data.height ?? ''}
            onChange={(e) => handleNumberChange('height', e.target.value)}
            aria-invalid={!!errors.height}
            aria-describedby={errors.height ? 'height-error' : undefined}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">
            cm
          </span>
        </div>
        {errors.height && <ErrorMessage id="height-error" message={errors.height} />}
      </div>

      <div>
        <label htmlFor="weight" className="label">Weight</label>
        <div className="relative">
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            className={`input pr-14 ${errors.weight ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
            placeholder="e.g. 70"
            value={data.weight ?? ''}
            onChange={(e) => handleNumberChange('weight', e.target.value)}
            aria-invalid={!!errors.weight}
            aria-describedby={errors.weight ? 'weight-error' : undefined}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">
            kg
          </span>
        </div>
        {errors.weight && <ErrorMessage id="weight-error" message={errors.weight} />}
      </div>
    </div>
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
