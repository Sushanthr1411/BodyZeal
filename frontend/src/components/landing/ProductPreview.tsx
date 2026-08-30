import { Dumbbell, Timer, CalendarCheck, ArrowRight, Trophy } from 'lucide-react';

export default function ProductPreview() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-4">Product preview</span>
          <h2 className="font-display text-3xl font-700 tracking-tight text-ink-900 sm:text-4xl">
            A dashboard built for real progress
          </h2>
          <p className="mt-4 text-lg text-ink-600 text-pretty">
            Here's a look at what's waiting inside — your daily summary, active
            streak, and a live feed of every set you log.
          </p>
        </div>

        <div className="mt-14">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-energy-400/15 via-transparent to-ink-900/5 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-lift">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-ink-200/70 bg-ink-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-ink-200" />
            <span className="h-3 w-3 rounded-full bg-ink-200" />
            <span className="h-3 w-3 rounded-full bg-ink-200" />
          </div>
          <span className="text-xs font-medium text-ink-400">Dashboard Preview</span>
          <span className="w-12" />
        </div>

        <div className="grid lg:grid-cols-[220px_1fr]">
          {/* sidebar */}
          <aside className="hidden border-r border-ink-200/70 bg-ink-50 p-4 lg:block">
            <div className="space-y-1">
              {['Dashboard', 'Roadmap', 'Personal Records', 'Exercise History'].map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    i === 0 ? 'bg-ink-900 text-white' : 'text-ink-600'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-energy-400' : 'bg-ink-300'}`} />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Current streak</p>
              <p className="mt-1 font-display text-2xl font-700 text-ink-900">12 🔥</p>
              <p className="text-[10px] text-ink-500">days in a row</p>
            </div>
          </aside>

          {/* main */}
          <div className="p-5 sm:p-6">
            {/* summary row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200/70 bg-ink-50 p-4">
                <div className="flex items-center gap-1.5 text-energy-600">
                  <CalendarCheck className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Today</span>
                </div>
                <p className="mt-1.5 font-display text-3xl font-700 text-ink-900">3</p>
                <p className="text-xs text-ink-500">exercises completed</p>
              </div>
              <div className="rounded-xl border border-ink-200/70 bg-ink-50 p-4">
                <div className="flex items-center gap-1.5 text-ink-500">
                  <Dumbbell className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Volume</span>
                </div>
                <p className="mt-1.5 font-display text-3xl font-700 text-ink-900">4,820</p>
                <p className="text-xs text-ink-500">kg lifted today</p>
              </div>
              <div className="col-span-2 rounded-xl border border-ink-200/70 bg-ink-50 p-4 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-ink-500">
                  <Timer className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Rest</span>
                </div>
                <p className="mt-1.5 font-display text-3xl font-700 text-ink-900">01:23</p>
                <p className="text-xs text-ink-500">countdown active</p>
              </div>
            </div>

            {/* personal records preview */}
            <div className="mt-4 rounded-xl border border-ink-200/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-energy-600" />
                  <p className="text-sm font-semibold text-ink-900">Personal Records</p>
                </div>
                <span className="chip text-[10px]">Auto-tracked</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { name: 'Bench Press', value: '80 kg', sub: '× 5 reps' },
                  { name: 'Back Squat', value: '110 kg', sub: '× 3 reps' },
                  { name: 'Deadlift', value: '130 kg', sub: '× 2 reps' },
                ].map((pr) => (
                  <div key={pr.name} className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{pr.name}</p>
                    <p className="mt-1 font-display text-base font-700 text-ink-900">
                      {pr.value} <span className="text-[11px] font-medium text-ink-500">{pr.sub}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* history preview */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-ink-900">Exercise History</p>
              <div className="space-y-2">
                {[
                  { date: 'Today', items: ['Bench Press — 4×8 @ 60kg', 'Squat — 3×10 @ 80kg'] },
                  { date: 'Yesterday', items: ['Pull-Up — 3×12', 'Run — 5km @ 5:00/km'] },
                ].map((group) => (
                  <div key={group.date} className="rounded-xl border border-ink-200/70 bg-white p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{group.date}</p>
                    <div className="mt-1.5 space-y-1">
                      {group.items.map((item) => (
                        <div key={item} className="flex items-center justify-between text-sm">
                          <span className="text-ink-700">{item}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-ink-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
