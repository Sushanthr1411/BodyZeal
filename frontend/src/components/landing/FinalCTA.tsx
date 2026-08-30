import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-energy-400/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <span className="chip border-ink-700 bg-ink-800 text-energy-400">
          <span className="h-1.5 w-1.5 rounded-full bg-energy-400" />
          Make every workout count
        </span>
        <h2 className="mt-5 font-display text-3xl font-700 tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
          Start training. Stay consistent.
          <br className="hidden sm:block" />
          <span className="text-energy-400">Watch your progress add up.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300 text-pretty">
          A guided plan, real coaching, and every rep tracked automatically —
          free to start, in under a minute.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn-accent text-base">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
