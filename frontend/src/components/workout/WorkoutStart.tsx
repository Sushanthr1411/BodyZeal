import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, Flame, Clock, ListOrdered, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import type { Routine } from '@/types/workout';
import { EXERCISES } from '@/data/exercises';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { workoutsThisWeek } from '@/lib/recentWorkouts';

type WorkoutStartProps = {
  routines: Routine[];
  customRoutines: Routine[];
  onStartRoutine: (routine: Routine) => void;
  onStartCustom: (name: string) => void;
  onCreateRoutine: () => void;
  onDeleteCustomRoutine: (id: string) => void;
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

function exerciseName(exerciseId: string): string {
  return EXERCISES.find((exercise) => exercise.id === exerciseId)?.name ?? exerciseId;
}

export default function WorkoutStart({
  routines,
  customRoutines,
  onStartRoutine,
  onStartCustom,
  onCreateRoutine,
  onDeleteCustomRoutine,
  recentWorkouts,
}: WorkoutStartProps) {
  const allRoutines = [...routines, ...customRoutines];
  const customIds = new Set(customRoutines.map((routine) => routine.id));
  const [expandedId, setExpandedId] = useState<string | null>(allRoutines[0]?.id ?? null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const thisWeek = workoutsThisWeek(recentWorkouts);
  const lastWorkout = recentWorkouts[0] ?? null;

  function handleCustomSubmit(event: React.FormEvent) {
    event.preventDefault();
    onStartCustom(customName.trim() || 'Workout');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="relative card rounded-3xl border-ink-200/70 p-6 shadow-lift sm:p-8">
          <div className="text-center">
            <span className="chip mx-auto w-fit border-energy-300/60 bg-energy-50 text-energy-800">
              <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
              Ready to train
            </span>
            <h2 className="mt-4 font-display text-[1.6rem] font-700 leading-tight tracking-tight text-ink-900">
              Choose your routine
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Pick a plan — every exercise and set is already lined up.
            </p>
          </div>

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

          <div className="mt-6 space-y-2.5">
            {allRoutines.map((routine) => {
              const expanded = expandedId === routine.id;
              const isCustom = customIds.has(routine.id);
              const totalSets = routine.exercises.reduce((total, ex) => total + ex.plannedSets, 0);
              return (
                <div
                  key={routine.id}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    expanded ? 'border-ink-900' : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setExpandedId((current) => (current === routine.id ? null : routine.id))}
                      className="flex flex-1 items-center justify-between gap-3 px-4 py-3.5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${expanded ? 'bg-ink-900 text-energy-400' : 'bg-ink-100 text-ink-500'}`}>
                          <ListOrdered className="h-4.5 w-4.5" strokeWidth={2} />
                        </span>
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                            {routine.name}
                            {isCustom && (
                              <span className="chip border-sky-300/60 bg-sky-50 text-[10px] text-sky-700">Custom</span>
                            )}
                          </p>
                          <p className="text-xs text-ink-500">
                            {routine.exercises.length} exercises · {totalSets} sets
                          </p>
                        </div>
                      </div>
                      <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }} className="shrink-0 text-ink-400">
                        <ChevronRight className="h-4 w-4" />
                      </motion.span>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomRoutine(routine.id)}
                        aria-label={`Delete ${routine.name}`}
                        className="mr-3 shrink-0 rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="border-t border-ink-200 bg-ink-50/50 px-4 py-3.5"
                    >
                      <ol className="space-y-1.5">
                        {routine.exercises.map((planned, index) => (
                          <li key={`${routine.id}-${planned.exerciseId}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2 text-ink-700">
                              <span className="w-4 shrink-0 text-xs font-semibold text-ink-400">{index + 1}.</span>
                              <span className="truncate">{exerciseName(planned.exerciseId)}</span>
                            </span>
                            <span className="shrink-0 text-xs font-medium text-ink-500">{planned.plannedSets} sets</span>
                          </li>
                        ))}
                      </ol>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => onStartRoutine(routine)}
                        className="btn-accent mt-4 w-full"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Start Workout
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={onCreateRoutine}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 px-4 py-3.5 text-sm font-medium text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
            >
              <PlusCircle className="h-4 w-4" />
              Create Routine
            </button>
          </div>

          <div className="mt-5 text-center">
            {customOpen ? (
              <form onSubmit={handleCustomSubmit} className="space-y-2.5 rounded-xl border border-dashed border-ink-200 p-4 text-left">
                <label htmlFor="custom-workout-name" className="label">Custom workout name</label>
                <input
                  id="custom-workout-name"
                  type="text"
                  placeholder="Freestyle session"
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  className="input"
                  autoFocus
                />
                <button type="submit" className="btn-outline w-full">
                  Start Custom Workout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCustomOpen(true)}
                className="text-xs font-medium text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline"
              >
                Or start a custom workout without a routine
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
