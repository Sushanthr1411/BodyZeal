import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Brand from '@/components/Brand';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import BasicProfileStep from '@/components/onboarding/BasicProfileStep';
import BodyInformationStep from '@/components/onboarding/BodyInformationStep';
import FitnessProfileStep from '@/components/onboarding/FitnessProfileStep';
import {
  validateBasicProfile,
  validateBodyInformation,
  validateFitnessProfile,
} from '@/components/onboarding/validation';
import { EMPTY_PROFILE, type UserProfile } from '@/types/profile';
import { useAuth } from '@/context/useAuth';
import { saveProfile } from '@/lib/profileStorage';

const TOTAL_STEPS = 3;

export default function OnboardingModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  function updateProfile(patch: Partial<UserProfile>) {
    setProfile((previous) => ({ ...previous, ...patch }));
    setErrors((previous) => {
      const next = { ...previous };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function validateCurrentStep(): boolean {
    let stepErrors: Record<string, string> = {};
    if (step === 1) {
      stepErrors = validateBasicProfile(profile);
    } else if (step === 2) {
      stepErrors = validateBodyInformation(profile);
    } else if (step === 3) {
      stepErrors = validateFitnessProfile(profile);
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    if (step >= TOTAL_STEPS) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setStep((s) => s + 1);
      setTransitioning(false);
    }, 150);
  }

  function goBack() {
    if (step <= 1) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setStep((s) => s - 1);
      setTransitioning(false);
    }, 150);
  }

  async function handleComplete() {
    if (!validateCurrentStep() || submitting) return;
    setSubmitting(true);
    if (user) saveProfile(user.uid, profile);
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="card p-6 sm:p-10">
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          <div className={`mt-8 transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
            {step === 1 && (
              <BasicProfileStep data={profile} errors={errors} onChange={updateProfile} />
            )}
            {step === 2 && (
              <BodyInformationStep data={profile} errors={errors} onChange={updateProfile} />
            )}
            {step === 3 && (
              <FitnessProfileStep data={profile} errors={errors} onChange={updateProfile} />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-200/70 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || submitting}
              className="btn-ghost disabled:opacity-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={goNext} className="btn-accent">
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handleComplete} disabled={submitting} className="btn-accent">
                {submitting ? 'Saving...' : 'Complete Profile'}
                {!submitting && <Check className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
