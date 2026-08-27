import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
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
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'History', icon: History, active: false },
  { label: 'Exercises', icon: Dumbbell, active: false },
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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-200/70 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-ink-200/70 px-5">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Brand />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
              {item.active && <ChevronRight className="ml-auto h-4 w-4 text-energy-400" />}
            </button>
          ))}
        </nav>
        <div className="border-t border-ink-200/70 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt="" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-sm font-700 text-energy-400">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{displayName}</p>
              <p className="truncate text-xs text-ink-500">{email}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link to="/settings" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Logging out...' : 'Log out'}
            </button>
            {logoutError && <p role="alert" className="mt-2 px-3 text-xs text-red-600">{logoutError}</p>}
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
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-lift animate-fade-up">
            <div className="flex h-16 items-center justify-between border-b border-ink-200/70 px-5">
              <Brand />
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    item.active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-ink-200/70 p-4">
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
              {logoutError && <p role="alert" className="mt-2 px-3 text-xs text-red-600">{logoutError}</p>}
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
