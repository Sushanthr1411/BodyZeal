import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Brand from '@/components/Brand';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/60 bg-ink-50/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="transition-opacity hover:opacity-80" aria-label="Fitness & Workout Log home">
          <Brand />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/signup"
            className="btn-ghost text-sm"
            state={{ from: location.pathname }}
          >
            Log in
          </Link>
          <Link to="/signup" className="btn-accent text-sm" state={{ from: location.pathname }}>
            Get Started
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-200/60 bg-ink-50 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              to="/signup"
              className="btn-outline w-full"
              state={{ from: location.pathname }}
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="btn-accent w-full"
              state={{ from: location.pathname }}
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
