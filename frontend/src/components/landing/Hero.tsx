import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Timer, CalendarCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div className="animate-fade-up">
            <span className="chip mb-5 border-energy-300/60 bg-energy-50 text-energy-800">
              <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
              Your complete training companion
            </span>
            <h1 className="font-display text-4xl font-700 leading-tight tracking-tight text-ink-900 text-balance sm:text-5xl lg:text-6xl">
              Track Every Set.
              <br />
              <span className="text-energy-600">Build Every Day.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-600 text-pretty">
              Log every rep with a guided timer, follow a plan built around your
              goal, and get coaching grounded in your own progress — from your
              first workout to your next personal record.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-accent text-base">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="btn-outline text-base">
                Explore Features
              </a>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-ink-200/70 pt-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Exercises</dt>
                <dd className="mt-1 whitespace-nowrap font-display text-xl font-700 text-ink-900">71+</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Coaching</dt>
                <dd className="mt-1 whitespace-nowrap font-display text-xl font-700 text-ink-900">AI-Powered</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Setup</dt>
                <dd className="mt-1 whitespace-nowrap font-display text-xl font-700 text-ink-900">Zero</dd>
              </div>
            </dl>
          </div>

          {/* Right: product mockup */}
          <div className="animate-scale-in lg:pl-4">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="group relative animate-float">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-energy-400/25 via-aqua-400/10 to-transparent blur-2xl animate-glow-pulse" />
      <div className="relative card overflow-hidden p-5 shadow-lift ring-1 ring-ink-900/5 transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-glow group-hover:ring-energy-400/20">
        {/* mock header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <span className="text-xs font-medium text-ink-400">Today's Session</span>
          <span className="chip border-energy-300/60 bg-energy-50 text-[10px] text-energy-800">
            🔥 12-day streak
          </span>
        </div>

        {/* summary strip */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { icon: CalendarCheck, tint: 'text-energy-600', label: 'Today', value: '3', sub: 'exercises' },
            { icon: Dumbbell, tint: 'text-ink-500', label: 'Volume', value: '4,820', sub: 'kg total' },
            { icon: Timer, tint: 'text-ink-500', label: 'Rest', value: '01:30', sub: 'countdown' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="animate-fade-up rounded-xl bg-ink-50 p-3 transition-colors duration-300 hover:bg-energy-50/60"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            >
              <div className={`flex items-center gap-1.5 ${stat.tint}`}>
                <stat.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="mt-1 font-display text-xl font-700 text-ink-900">{stat.value}</p>
              <p className="text-[10px] text-ink-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* mock entry rows */}
        <div className="space-y-2.5">
          {[
            { name: 'Bench Press', sets: 4, reps: 8, weight: 60, volume: 1920 },
            { name: 'Squat', sets: 3, reps: 10, weight: 80, volume: 2400 },
            { name: 'Pull-Up', sets: 3, reps: 12, weight: 0, volume: 0 },
          ].map((row, i) => (
            <div
              key={row.name}
              className="group/row flex animate-fade-up items-center justify-between rounded-xl border border-ink-200/70 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-energy-300/60 hover:shadow-soft"
              style={{ animationDelay: `${420 + i * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-900 text-energy-400 transition-transform duration-300 group-hover/row:scale-110">
                  <Dumbbell className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink-900">{row.name}</p>
                    {row.name === 'Bench Press' && (
                      <span className="animate-pulse rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                        New PR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-500">
                    {row.sets} sets · {row.reps} reps · {row.weight} kg
                  </p>
                </div>
              </div>
              <span className="font-display text-sm font-700 text-energy-700">
                {row.volume > 0 ? row.volume.toLocaleString() : 'Bodyweight'}
              </span>
            </div>
          ))}
        </div>

        {/* mock rest timer */}
        <div className="mt-4 flex animate-fade-up items-center gap-3 rounded-xl bg-ink-900 p-3 text-white" style={{ animationDelay: '750ms' }}>
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-energy-400" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-energy-400" />
          </span>
          <span className="text-sm font-medium">Rest timer running</span>
          <span className="ml-auto font-display text-sm font-700 text-energy-400">01:23</span>
        </div>
      </div>
    </div>
  );
}
