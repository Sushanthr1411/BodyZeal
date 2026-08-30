import { Clock, Dumbbell, ListChecks, Trash2, Zap } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { formatTime, groupSetsByExercise } from '@/utils/workout';

type WorkoutRecordCardProps = {
  workout: RecentWorkout;
  /** Unique prefix for synthesizing per-set ids (grouping needs a WorkoutSet id, which RecentWorkoutSet doesn't carry). */
  idPrefix: string;
  /** Omit to hide the delete control entirely (e.g. contexts without a workout id). */
  onDelete?: (workout: RecentWorkout) => void;
  isDeleting?: boolean;
};

/** One finished-workout summary card: name/time, duration/sets/volume chips, and its exercise breakdown. Shared across the Exercise History page. */
export default function WorkoutRecordCard({ workout, idPrefix, onDelete, isDeleting }: WorkoutRecordCardProps) {
  const grouped = groupSetsByExercise(
    (workout.sets ?? []).map((set, index) => ({
      id: `${idPrefix}-${index}`,
      exerciseName: set.exerciseName,
      sets: 1,
      reps: set.reps,
      weight: set.weight,
      volume: set.volume,
      loggedAt: workout.finishedAt,
    })),
  );

  return (
    <div className="card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-energy-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-ink-900">{workout.name}</p>
            {workout.kind === 'quickLog' && (
              <span className="chip border-sky-300/60 bg-sky-50 text-[10px] text-sky-700">
                <Zap className="h-2.5 w-2.5" />
                Quick log
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-500">
            {new Date(workout.finishedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {workout.durationSeconds !== undefined && workout.durationSeconds > 0 && (
            <span className="chip border-ink-200 bg-white text-ink-700">
              <Clock className="h-3 w-3 text-ink-400" />
              {formatTime(workout.durationSeconds)}
            </span>
          )}
          <span className="chip border-ink-200 bg-white text-ink-700">
            <ListChecks className="h-3 w-3 text-ink-400" />
            {workout.totalSets ?? workout.sets?.length ?? 0} sets
          </span>
          <span className="chip border-energy-300/60 bg-energy-50 text-energy-800">
            {workout.totalVolume.toLocaleString()} kg
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(workout)}
              disabled={isDeleting}
              aria-label={`Delete ${workout.name}`}
              className="inline-flex items-center gap-1 rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {grouped.length > 0 && (
        <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {grouped.map((exercise) => (
            <div
              key={exercise.exerciseName}
              className="flex items-center justify-between gap-3 rounded-lg bg-aqua-50/40 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span className="truncate text-sm font-medium text-ink-800">{exercise.exerciseName}</span>
              </span>
              <span className="shrink-0 text-xs text-ink-500">
                {exercise.sets.length} × {exercise.sets[0]?.reps ?? 0} reps · {exercise.volume.toLocaleString()} kg
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
