import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeft,
  BarChart3,
  Dumbbell,
  Layers,
  ListChecks,
  ListOrdered,
  PlayCircle,
  Repeat,
  Target,
  Trophy,
  Weight,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/common/EmptyState';
import TutorialModal from '@/components/exercises/TutorialModal';
import { EXERCISES } from '@/data/exercises';
import { EXERCISE_TUTORIALS } from '@/data/exerciseTutorials';
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import { exerciseProgress, exerciseStats } from '@/utils/analytics';

const RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '3m', label: '3M', days: 90 },
  { key: 'all', label: 'All', days: null },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

type Metric = 'weight' | 'volume';

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeKey>('30d');
  const [metric, setMetric] = useState<Metric>('weight');
  const [history, setHistory] = useState<RecentWorkout[]>([]);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;
    loadRecentWorkouts().then((loaded) => {
      if (!cancelled) setHistory(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const exercise = EXERCISES.find((item) => item.id === id);
  const tutorial = exercise ? EXERCISE_TUTORIALS[exercise.id] : undefined;

  const allPoints = useMemo(
    () => (exercise ? exerciseProgress(history, exercise.name) : []),
    [history, exercise],
  );
  const stats = useMemo(
    () => (exercise ? exerciseStats(history, exercise.name) : null),
    [history, exercise],
  );

  const activeRange = RANGES.find((r) => r.key === range) ?? RANGES[1];
  const chartPoints = useMemo(() => {
    if (activeRange.days === null) return allPoints;
    const cutoff = Date.now() - activeRange.days * 24 * 60 * 60 * 1000;
    return allPoints.filter((point) => new Date(point.finishedAt).getTime() >= cutoff);
  }, [allPoints, activeRange]);

  const recentPoints = allPoints.slice().reverse().slice(0, 10);

  if (!exercise) {
    return (
      <DashboardLayout>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl card p-8">
            <EmptyState
              icon={Dumbbell}
              title="Exercise not found"
              description="This exercise doesn't exist in the library."
            />
            <button type="button" onClick={() => navigate('/exercises')} className="btn-outline mx-auto mt-5 w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back to Exercises
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="border-b border-ink-200/70 bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Exercises
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink-900 text-energy-400">
              <Dumbbell className="h-7 w-7" strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                {exercise.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="chip border-sky-300/60 bg-sky-50 text-sky-700">
                  <Layers className="h-3 w-3" />
                  {exercise.equipment}
                </span>
                <span className="chip border-coral-300/60 bg-coral-50 text-coral-700">
                  <Target className="h-3 w-3" />
                  {exercise.muscleGroup}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {tutorial && (
              <button
                type="button"
                onClick={() => setTutorialOpen(true)}
                className="btn-outline"
              >
                <ListOrdered className="h-4 w-4" />
                Tutorial
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/workout', { state: { quickLogExerciseId: exercise.id } })}
              className="btn-accent"
            >
              <PlayCircle className="h-4 w-4" />
              Log this exercise
            </button>
          </div>
        </div>
      </div>

      {tutorial && (
        <TutorialModal
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
          exercise={exercise}
          tutorial={tutorial}
        />
      )}

      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {!stats ? (
            <div className="card p-8">
              <EmptyState
                icon={BarChart3}
                title="No history for this exercise yet"
                description="Log this exercise in a workout and your performance, progress chart, and personal records will show up here."
              />
            </div>
          ) : (
            <>
              {/* Your performance */}
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">Your Performance</p>
                <div className="card grid grid-cols-2 divide-y divide-ink-200/70 overflow-hidden sm:grid-cols-5 sm:divide-x sm:divide-y-0">
                  {[
                    { label: 'Best weight', value: `${stats.bestWeight} kg`, icon: Weight, tint: 'bg-violet-50/40 text-violet-600' },
                    { label: 'Best reps', value: stats.bestReps, icon: Repeat, tint: 'bg-sky-50/40 text-sky-600' },
                    { label: 'Best set volume', value: `${stats.bestSetVolume.toLocaleString()} kg`, icon: Trophy, tint: 'bg-energy-50/40 text-energy-600' },
                    { label: 'Total volume', value: `${stats.totalVolume.toLocaleString()} kg`, icon: BarChart3, tint: 'bg-aqua-50/40 text-aqua-600' },
                    { label: 'Times performed', value: stats.timesPerformed, icon: ListChecks, tint: 'bg-coral-50/40 text-coral-600' },
                  ].map((stat) => (
                    <div key={stat.label} className={`flex flex-col gap-2 p-4 ${stat.tint.split(' ')[0]}`}>
                      <span className={`grid h-8 w-8 place-items-center rounded-lg bg-white ${stat.tint.split(' ')[1]}`}>
                        <stat.icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="text-[11px] font-medium text-ink-500">{stat.label}</p>
                        <p className="mt-0.5 font-display text-lg font-extrabold text-ink-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress chart */}
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                      <BarChart3 className="h-4.5 w-4.5" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Progress</p>
                      <p className="text-xs text-ink-500">{metric === 'weight' ? 'Top weight' : 'Volume'} per session</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg bg-ink-100 p-0.5">
                      {(['weight', 'volume'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMetric(m)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                            metric === m ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="flex rounded-lg bg-ink-100 p-0.5">
                      {RANGES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRange(r.key)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            range === r.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-56">
                  {chartPoints.length === 0 ? (
                    <div className="grid h-full place-items-center text-sm text-ink-400">
                      No sessions in this range.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#E1D9C7" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} width={36} />
                        <Tooltip
                          contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                          labelStyle={{ color: '#1D1811', fontWeight: 600, marginBottom: 2 }}
                          formatter={(value) => [`${Number(value).toLocaleString()} kg`, metric === 'weight' ? 'Top weight' : 'Volume']}
                        />
                        <Line
                          type="monotone"
                          dataKey={metric === 'weight' ? 'topWeight' : 'volume'}
                          stroke="#8F4F7E"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#8F4F7E', strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent performance */}
                <div className="card overflow-hidden p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
                      <ListChecks className="h-4.5 w-4.5" strokeWidth={2} />
                    </span>
                    <p className="text-sm font-semibold text-ink-900">Recent Performance</p>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-ink-400">
                          <th className="pb-2 font-semibold">Date</th>
                          <th className="pb-2 font-semibold">Sets</th>
                          <th className="pb-2 font-semibold">Reps</th>
                          <th className="pb-2 font-semibold">Weight</th>
                          <th className="pb-2 text-right font-semibold">Volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {recentPoints.map((point) => (
                          <tr key={point.dateKey}>
                            <td className="py-2 font-medium text-ink-800">{point.label}</td>
                            <td className="py-2 text-ink-600">{point.setCount}</td>
                            <td className="py-2 text-ink-600">{point.topReps}</td>
                            <td className="py-2 text-ink-600">{point.topWeight} kg</td>
                            <td className="py-2 text-right font-semibold text-ink-900">{point.volume.toLocaleString()} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Personal records */}
                <div className="card overflow-hidden p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-energy-50 text-energy-600">
                      <Trophy className="h-4.5 w-4.5" strokeWidth={2} />
                    </span>
                    <p className="text-sm font-semibold text-ink-900">Personal Records</p>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl bg-violet-50/40 px-4 py-3">
                      <span className="text-sm font-medium text-ink-700">Heaviest weight</span>
                      <span className="font-display text-base font-extrabold text-ink-900">
                        {stats.heaviestWeightRecord.weight} kg <span className="text-xs font-medium text-ink-500">× {stats.heaviestWeightRecord.reps} reps</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-aqua-50/40 px-4 py-3">
                      <span className="text-sm font-medium text-ink-700">Highest-volume session</span>
                      <span className="font-display text-base font-extrabold text-ink-900">
                        {stats.highestVolumeSession.volume.toLocaleString()} kg <span className="text-xs font-medium text-ink-500">on {stats.highestVolumeSession.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-coral-50/40 px-4 py-3">
                      <span className="text-sm font-medium text-ink-700">Best rep performance</span>
                      <span className="font-display text-base font-extrabold text-ink-900">
                        {stats.bestRepsRecord.reps} reps <span className="text-xs font-medium text-ink-500">@ {stats.bestRepsRecord.weight} kg</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
