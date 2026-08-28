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
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    loadProfile(user.uid).then((loaded) => {
      if (!cancelled) {
        setProfile(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || saving || !validateProfile()) return;
    setSaving(true);
    setSaveError('');
    try {
      await saveProfile(user.uid, profile);
      setSaved(true);
    } catch {
      setSaveError('Could not save your changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Settings" description="Manage your basic profile and fitness details." />
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-ink-500 sm:px-6 lg:px-8">
          Loading your profile...
        </main>
      </DashboardLayout>
    );
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
            {saveError && (
              <p role="alert" className="mr-auto text-sm font-medium text-red-600">{saveError}</p>
            )}
            {saved && !saveError && (
              <p className="mr-auto flex items-center gap-1.5 text-sm font-medium text-energy-800" role="status">
                <Check className="h-4 w-4" />
                Profile updated
              </p>
            )}
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-accent" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
              {!saving && <Check className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </main>
    </DashboardLayout>
  );
}
