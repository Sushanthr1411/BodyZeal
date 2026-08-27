import { useState } from 'react';
import { PlayCircle, ArrowRight, Flame, Clock } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { quickPickNames, workoutsThisWeek } from '@/lib/recentWorkouts';

type WorkoutStartProps = {
  onStart: (name: string) => void;
  recentWorkouts: RecentWorkout[];
};

function relativeDay(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((startOfNow - startOfThen) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function WorkoutStart({ onStart, recentWorkouts }: WorkoutStartProps) {
  const [name, setName] = useState('');
  const chips = quickPickNames(recentWorkouts);
  const thisWeek = workoutsThisWeek(recentWorkouts);
  const lastWorkout = recentWorkouts[0] ?? null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onStart(name.trim() || 'Workout');
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="relative card rounded-3xl border-ink-200/70 p-7 text-center shadow-lift sm:p-9">
          <span className="chip mx-auto w-fit border-energy-300/60 bg-energy-50 text-energy-800">
            <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
            Ready to train
          </span>

          <span className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink-900 text-energy-400 shadow-soft">
            <PlayCircle className="h-7 w-7" strokeWidth={2} />
          </span>

          <h2 className="mt-5 font-display text-[1.75rem] font-700 leading-tight tracking-tight text-ink-900">
            Start a workout
          </h2>
          <p className="mt-1.5 text-sm text-ink-500">
            Build your session one set at a time.
          </p>

          {(thisWeek > 0 || lastWorkout) && (
            <div className="mt-6 grid grid-cols-2 gap-2.5 text-left">
              <div className="rounded-xl bg-energy-50/60 px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-energy-600">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">This week</span>
                </div>
                <p className="mt-1 font-display text-xl font-700 text-ink-900">{thisWeek}</p>
                <p className="text-[11px] text-ink-500">{thisWeek === 1 ? 'workout' : 'workouts'}</p>
              </div>
              <div className="rounded-xl bg-sky-50/60 px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-sky-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Last workout</span>
                </div>
                <p className="mt-1 truncate font-display text-base font-700 text-ink-900">
                  {lastWorkout ? lastWorkout.name : '—'}
                </p>
                <p className="text-[11px] text-ink-500">{lastWorkout ? relativeDay(lastWorkout.finishedAt) : 'None yet'}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-3 text-left">
            <div>
              <label htmlFor="workout-name" className="label">Workout name</label>
              <input
                id="workout-name"
                type="text"
                placeholder="Push Day"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setName(chip)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    name === chip
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-accent w-full">
              Start Workout
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
