import { Dumbbell, History, Calculator, ListChecks, Timer, CalendarCheck } from 'lucide-react';
import { FEATURE_LIST } from '@/data/appData';

const ICONS = {
  Dumbbell,
  History,
  Calculator,
  ListChecks,
  Timer,
  CalendarCheck,
} as const;

export default function FeatureSection() {
  return (
    <section id="features" className="relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-4">Core capabilities</span>
          <h2 className="font-display text-3xl font-700 tracking-tight text-ink-900 text-balance sm:text-4xl">
            Everything you need to log a workout
          </h2>
          <p className="mt-4 text-lg text-ink-600 text-pretty">
            No clutter. No noise. Just the tools that help you record, track, and
            review your training.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_LIST.map((feature, i) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS];
            return (
              <article
                key={feature.title}
                className="group card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-900 text-energy-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <h3 className="mt-5 font-display text-lg font-700 text-ink-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
