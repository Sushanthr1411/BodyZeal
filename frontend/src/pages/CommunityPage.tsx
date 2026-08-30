import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, MessagesSquare, Sparkles, Users2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';

const UPCOMING = [
  { icon: MessagesSquare, label: 'Workout discussions & tips' },
  { icon: Users2, label: 'Follow friends & training buddies' },
  { icon: Sparkles, label: 'Share your PRs and progress' },
];

export default function CommunityPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader title="Community" description="Connect with other BodyZeal members." />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="card relative overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-violet-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-energy-100/60 blur-3xl" />

          <div className="relative">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink-900 text-energy-400 shadow-soft animate-fade-up">
              <Hammer className="h-8 w-8" strokeWidth={2} />
            </span>

            <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              Under Development
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-500 sm:text-base">
              We're building a space for BodyZeal members to connect, share progress, and stay motivated together.
              Community is coming soon — check back later!
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {UPCOMING.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-ink-200/70 bg-ink-50/60 px-4 py-5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-violet-600 shadow-soft">
                    <item.icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <p className="text-xs font-medium text-ink-700">{item.label}</p>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline mx-auto mt-9">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
