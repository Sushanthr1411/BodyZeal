import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  History,
  Dumbbell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import Brand from '@/components/Brand';
import { useAuth } from '@/context/useAuth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { loadProfile } from '@/lib/profileStorage';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Log Workout', icon: PlayCircle, to: '/workout' },
  { label: 'Exercises', icon: Dumbbell, to: '/exercises' },
  { label: 'History', icon: History, to: '/history' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(() => user ? loadProfile(user.uid) : null);

  useEffect(() => {
    setProfile(user ? loadProfile(user.uid) : null);
  }, [user]);

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Athlete';
  const email = user?.email || 'Signed in';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(getAuthErrorMessage(error, 'Unable to log out. Try again.'));
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar — dark surface for strong contrast against the light content area */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-950 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link to="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-400 text-ink-950 shadow-soft">
              <Dumbbell className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              Body<span className="text-energy-400">Zeal</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-energy-400 text-ink-950 shadow-soft'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
                {active && <ChevronRight className="ml-auto h-4 w-4 text-ink-950/60" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt="" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-400 text-sm font-semibold text-ink-950">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-ink-400">{email}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link
              to="/settings"
              aria-current={location.pathname === '/settings' ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/settings' ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Logging out...' : 'Log out'}
            </button>
            {logoutError && <p role="alert" className="mt-2 px-3 text-xs text-coral-400">{logoutError}</p>}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200/70 bg-white px-4 lg:hidden">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Brand />
        </Link>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-ink-950 shadow-lift animate-fade-up">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <span className="inline-flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-energy-400 text-ink-950">
                  <Dumbbell className="h-4.5 w-4.5" strokeWidth={2.5} />
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-white">
                  Body<span className="text-energy-400">Zeal</span>
                </span>
              </span>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-4">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      active ? 'bg-energy-400 text-ink-950' : 'text-ink-300 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-4">
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                aria-current={location.pathname === '/settings' ? 'page' : undefined}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/settings' ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
              {logoutError && <p role="alert" className="mt-2 px-3 text-xs text-coral-400">{logoutError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
