import { useEffect, useState } from 'react';
import { AlertCircle, Check, KeyRound, Mail } from 'lucide-react';
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
import { getAuthErrorMessage } from '@/lib/authErrors';
import { EMPTY_PROFILE, type UserProfile } from '@/types/profile';

type ProfileErrors = Record<string, string>;

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, resetPassword } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [passwordSending, setPasswordSending] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  async function handleChangePassword() {
    if (!user?.email || passwordSending) return;
    setPasswordError('');
    setPasswordSending(true);
    try {
      await resetPassword(user.email);
      setPasswordSent(true);
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error, "Couldn't send the reset link. Try again."));
    } finally {
      setPasswordSending(false);
    }
  }

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

          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                <KeyRound className="h-4.5 w-4.5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Password</p>
                <p className="text-xs text-ink-500">Change your account password via a secure email link.</p>
              </div>
            </div>

            {passwordSent ? (
              <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-energy-50/60 px-3 py-2.5 text-sm text-energy-800">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                Check <span className="font-medium">{user?.email}</span> for a link to set a new password.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={passwordSending || !user?.email}
                className="btn-outline mt-4 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordSending ? 'Sending link...' : 'Change Password'}
              </button>
            )}
            {passwordError && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {passwordError}
              </p>
            )}
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
