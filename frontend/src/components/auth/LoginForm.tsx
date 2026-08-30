import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/useAuth';
import { getAuthErrorMessage } from '@/lib/authErrors';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [mode, setMode] = useState<'login' | 'reset'>(
    (location.state as { openReset?: boolean } | null)?.openReset ? 'reset' : 'login',
  );
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (resetSending) return;
    const trimmed = resetEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setResetError('Enter a valid email address.');
      return;
    }
    setResetError('');
    setResetSending(true);
    try {
      await resetPassword(trimmed);
      setResetSent(true);
    } catch (error) {
      setResetError(getAuthErrorMessage(error, "Couldn't send the reset link. Try again."));
    } finally {
      setResetSending(false);
    }
  }

  function backToLogin() {
    setMode('login');
    setResetSent(false);
    setResetError('');
  }

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!password) {
      next.password = 'Enter your password.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setAuthError('');
    try {
      await login(email.trim(), password, remember);
      navigate('/dashboard');
    } catch (error) {
      setAuthError(getAuthErrorMessage(error, 'Unable to log in. Try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === 'reset') {
    return (
      <AuthLayout>
        <button
          type="button"
          onClick={backToLogin}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to log in
        </button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-700 tracking-tight text-ink-900">Reset your password</h1>
          <p className="mt-2 text-ink-600">
            Enter your account email and we'll send you a link to set a new password.
          </p>
        </div>

        {resetSent ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-energy-50/60 px-4 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-energy-600" strokeWidth={2} />
            <p className="text-sm font-semibold text-ink-900">Check your email</p>
            <p className="text-sm text-ink-500">
              If an account exists for <span className="font-medium text-ink-700">{resetEmail.trim()}</span>, a
              password reset link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div>
              <label htmlFor="reset-email" className="label">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  className={`input pl-11 ${resetError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetError) setResetError('');
                  }}
                  aria-invalid={!!resetError}
                />
              </div>
              {resetError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {resetError}
                </p>
              )}
            </div>
            <button type="submit" className="btn-accent w-full text-base" disabled={resetSending}>
              {resetSending ? 'Sending link...' : 'Send reset link'}
              {!resetSending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-700 tracking-tight text-ink-900">
          Welcome back
        </h1>
        <p className="mt-2 text-ink-600">
          Log in to access your workout dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input pl-11 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input px-11 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-900/20"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setMode('reset');
            }}
            className="text-sm text-ink-500 hover:text-ink-800"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="btn-accent w-full text-base" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Log in'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
        {authError && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {authError}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-ink-900 hover:underline">
          Get started
        </Link>
      </p>

      <p className="mt-4 rounded-lg bg-ink-100/70 px-3 py-2 text-center text-xs text-ink-500">
        Sign in securely with your Firebase account.
      </p>
    </AuthLayout>
  );
}
