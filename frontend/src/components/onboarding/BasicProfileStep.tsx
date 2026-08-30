import { useRef } from 'react';
import { AlertCircle, Camera, User } from 'lucide-react';
import { GENDER_OPTIONS, type UserProfile } from '@/types/profile';
import type { BasicProfileErrors } from '@/components/onboarding/validation';

type BasicProfileStepProps = {
  data: Pick<UserProfile, 'fullName' | 'dateOfBirth' | 'gender' | 'profilePhoto'>;
  errors: BasicProfileErrors;
  onChange: (patch: Partial<UserProfile>) => void;
};

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

export default function BasicProfileStep({ data, errors, onChange }: BasicProfileStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_PHOTO_BYTES) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ profilePhoto: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-700 tracking-tight text-ink-900">
          Let's get to know you
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          A few basics to personalize your BodyZeal experience.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-ink-200 bg-ink-100 text-ink-400 transition-colors hover:border-ink-300"
          aria-label="Upload profile photo"
        >
          {data.profilePhoto ? (
            <img src={data.profilePhoto} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-ink-950/0 text-white opacity-0 transition-all group-hover:bg-ink-950/40 group-hover:opacity-100">
            <Camera className="h-5 w-5" />
          </span>
        </button>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-semibold text-ink-900 hover:underline"
          >
            {data.profilePhoto ? 'Change photo' : 'Add a profile photo'}
          </button>
          <p className="mt-0.5 text-xs text-ink-500">Optional. JPG or PNG, up to 3MB.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="label">Full Name</label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className={`input ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          placeholder="Your full name"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && <ErrorMessage id="fullName-error" message={errors.fullName} />}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="label">Date of Birth</label>
        <input
          id="dateOfBirth"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          className={`input ${errors.dateOfBirth ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          value={data.dateOfBirth}
          onChange={(e) => onChange({ dateOfBirth: e.target.value })}
          aria-invalid={!!errors.dateOfBirth}
          aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
        />
        {errors.dateOfBirth && <ErrorMessage id="dateOfBirth-error" message={errors.dateOfBirth} />}
      </div>

      <div>
        <span className="label">Gender</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {GENDER_OPTIONS.map((option) => (
            <GenderOption
              key={option.value}
              label={option.label}
              selected={data.gender === option.value}
              onSelect={() => onChange({ gender: option.value })}
            />
          ))}
        </div>
        {errors.gender && <ErrorMessage id="gender-error" message={errors.gender} />}
      </div>
    </div>
  );
}

function GenderOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        selected
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      }`}
    >
      {label}
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
