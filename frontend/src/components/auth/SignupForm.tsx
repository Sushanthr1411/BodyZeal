import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRound, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/useAuth';
import { getAuthErrorMessage } from '@/lib/authErrors';

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: SignupErrors = {};
    if (!name.trim()) {
      next.name = 'Enter your name.';
    }
    if (!email.trim()) {
      next.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!password) {
      next.password = 'Create a password.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Re-type your password.';
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
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
      await signup(email.trim(), password);
      navigate('/dashboard');
    } catch (error) {
      setAuthError(getAuthErrorMessage(error, 'Unable to create your account. Try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: keyof SignupErrors, value: string, setter: (value: string) => void) {
    setter(value);
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-700 tracking-tight text-ink-900">
          Create your account
        </h1>
        <p className="mt-2 text-ink-600">
          Start logging your workouts and build consistency.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={`input pl-11 ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
              placeholder="Your name"
              value={name}
              onChange={(e) => updateField('name', e.target.value, setName)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </div>
          {errors.name && <ErrorMessage id="name-error" message={errors.name} />}
        </div>

        <div>
          <label htmlFor="signup-email" className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              className={`input pl-11 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => updateField('email', e.target.value, setEmail)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
            />
          </div>
          {errors.email && <ErrorMessage id="signup-email-error" message={errors.email} />}
        </div>

        <PasswordField
          id="signup-password"
          label="New password"
          placeholder="At least 6 characters"
          value={password}
          error={errors.password}
          visible={showPassword}
          autoComplete="new-password"
          onChange={(value) => updateField('password', value, setPassword)}
          onToggle={() => setShowPassword((value) => !value)}
        />

        <PasswordField
          id="confirm-password"
          label="Re-type password"
          placeholder="Type your password again"
          value={confirmPassword}
          error={errors.confirmPassword}
          visible={showConfirmPassword}
          autoComplete="new-password"
          onChange={(value) => updateField('confirmPassword', value, setConfirmPassword)}
          onToggle={() => setShowConfirmPassword((value) => !value)}
        />

        <button type="submit" className="btn-accent w-full text-base" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
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
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink-900 hover:underline">
          Log in
        </Link>
      </p>

      <p className="mt-4 rounded-lg bg-ink-100/70 px-3 py-2 text-center text-xs text-ink-500">
        Your account is secured with Firebase Authentication.
      </p>
    </AuthLayout>
  );
}

function ErrorMessage({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  visible: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  error,
  visible,
  autoComplete,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={`input px-11 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
}
