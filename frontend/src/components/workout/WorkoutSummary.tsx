import { CheckCircle2, RotateCcw, LayoutDashboard } from 'lucide-react';
import { formatTime } from '@/utils/workout';

type WorkoutSummaryProps = {
  workoutName: string;
  exercisesCompleted: number;
  totalSets: number;
  totalVolume: number;
  durationSeconds: number;
  onStartNew: () => void;
  onBackToDashboard: () => void;
};

export default function WorkoutSummary({
  workoutName,
  exercisesCompleted,
  totalSets,
  totalVolume,
  durationSeconds,
  onStartNew,
  onBackToDashboard,
}: WorkoutSummaryProps) {
  const stats = [
    { label: 'Exercises', value: exercisesCompleted, tint: 'bg-aqua-50/60' },
    { label: 'Total sets', value: totalSets, tint: 'bg-sky-50/60' },
    { label: 'Total volume', value: `${totalVolume.toLocaleString()} kg`, tint: 'bg-energy-50/60' },
    { label: 'Duration', value: formatTime(durationSeconds), tint: 'bg-violet-50/60' },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-6 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-energy-50 text-energy-600">
          <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-700 tracking-tight text-ink-900">
          Workout complete
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">{workoutName}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 text-left ${stat.tint}`}>
              <p className="text-xs text-ink-500">{stat.label}</p>
              <p className="mt-1 font-display text-xl font-700 text-ink-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onStartNew} className="btn-outline flex-1">
            <RotateCcw className="h-4 w-4" />
            Start another workout
          </button>
          <button type="button" onClick={onBackToDashboard} className="btn-accent flex-1">
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
