import { Link } from 'react-router-dom';
import { ArrowRight, Swords } from 'lucide-react';
import type { ActiveSessionSnapshot } from '@/lib/activeSession';
import { routineProgress } from '@/utils/routine';

type TodaysTrainingCardProps = {
  session: ActiveSessionSnapshot;
};

export default function TodaysTrainingCard({ session }: TodaysTrainingCardProps) {
  const { completed, total } = routineProgress(session.exercises, session.entries, session.plannedSets);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-energy-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-energy-400">
            <Swords className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Today's Training</p>
            <p className="truncate text-xs text-ink-500">{session.workoutName}</p>
          </div>
        </div>
        <Link to="/workout" className="btn-accent shrink-0">
          Continue Workout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {total > 0 && (
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Progress</span>
            <span className="font-semibold text-ink-900">{completed} / {total} exercises</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-energy-400 transition-[width] duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
