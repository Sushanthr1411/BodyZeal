import { HOW_IT_WORKS } from '@/data/appData';

export default function HowItWorks() {
  return (
    <section className="relative border-y border-ink-200/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-4">How it works</span>
          <h2 className="font-display text-3xl font-700 tracking-tight text-ink-900 sm:text-4xl">
            Three steps. That's it.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-5xl font-700 text-energy-400">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display text-xl font-700 text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
