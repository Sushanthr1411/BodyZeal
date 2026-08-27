import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import BasicProfileStep from '@/components/onboarding/BasicProfileStep';
import BodyInformationStep from '@/components/onboarding/BodyInformationStep';
import FitnessProfileStep from '@/components/onboarding/FitnessProfileStep';
import {
  validateBasicProfile,
  validateBodyInformation,
  validateFitnessProfile,
} from '@/components/onboarding/validation';
import { useAuth } from '@/context/useAuth';
import { loadProfile, saveProfile } from '@/lib/profileStorage';
import { EMPTY_PROFILE, type UserProfile } from '@/types/profile';

type ProfileErrors = Record<string, string>;

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setProfile(loadProfile(user.uid));
  }, [user]);

  function updateProfile(patch: Partial<UserProfile>) {
    setProfile((previous) => ({ ...previous, ...patch }));
    setErrors((previous) => {
      const next = { ...previous };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
    setSaved(false);
  }

  function validateProfile() {
    const next: ProfileErrors = {
      ...validateBasicProfile(profile),
      ...validateBodyInformation(profile),
      ...validateFitnessProfile(profile),
    };
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !validateProfile()) return;
    saveProfile(user.uid, profile);
    setSaved(true);
  }

  return (
    <DashboardLayout>
      <PageHeader title="Settings" description="Manage your basic profile and fitness details." />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="card p-6 sm:p-8">
            <BasicProfileStep
              data={profile}
              errors={errors}
              onChange={updateProfile}
            />
          </section>

          <section className="card p-6 sm:p-8">
            <BodyInformationStep
              data={profile}
              errors={errors}
              onChange={updateProfile}
            />
          </section>

          <section className="card p-6 sm:p-8">
            <FitnessProfileStep
              data={profile}
              errors={errors}
              onChange={updateProfile}
            />
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {saved && (
              <p className="mr-auto flex items-center gap-1.5 text-sm font-medium text-energy-800" role="status">
                <Check className="h-4 w-4" />
                Profile updated
              </p>
            )}
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-accent">
              Save changes
              <Check className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </DashboardLayout>
  );
}
