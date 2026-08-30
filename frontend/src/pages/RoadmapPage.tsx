import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarRange,
  Compass,
  Loader2,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/context/useAuth';
import { loadProfile } from '@/lib/profileStorage';
import { loadRecentWorkouts, type RecentWorkout } from '@/lib/recentWorkouts';
import { loadCustomRoutines, saveCustomRoutine } from '@/lib/customRoutines';
import { generateRoadmap, type Roadmap, type RoadmapDay } from '@/utils/roadmap';
import { muscleGroupAccent } from '@/utils/muscleGroupColor';
import type { Routine } from '@/types/workout';
import type { UserProfile } from '@/types/profile';

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<RecentWorkout[]>([]);
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);
  const [startingDay, setStartingDay] = useState<string | null>(null);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([loadProfile(user.uid), loadRecentWorkouts(200), loadCustomRoutines()]).then(
      ([loadedProfile, loadedHistory, loadedRoutines]) => {
        if (cancelled) return;
        setProfile(loadedProfile);
        setHistory(loadedHistory);
        setCustomRoutines(loadedRoutines);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  const roadmap: Roadmap | null = useMemo(() => {
    if (!profile) return null;
    return generateRoadmap(profile, history);
  }, [profile, history]);

  async function handleStartDay(day: RoadmapDay, levelLabel: string) {
    if (startingDay) return;
    const routineName = `Roadmap · ${day.title} (${levelLabel})`;
    setStartError('');
    setStartingDay(day.title);
    try {
      // Reuse an already-saved roadmap routine with the same name instead of creating
      // a fresh duplicate every time the user clicks "Start this day".
      const existing = customRoutines.find((routine) => routine.name === routineName);
      const routine =
        existing ??
        (await saveCustomRoutine({
          id: 'temp',
          name: routineName,
          exercises: day.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId, plannedSets: exercise.sets })),
        }));
      navigate('/workout', { state: { startRoutineId: routine.id, startRoutineName: routine.name } });
    } catch {
      setStartError("Couldn't start that day — try again in a moment.");
      setStartingDay(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Roadmap" description="A personalized training plan built around your goal." />
        <main className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-ink-500 sm:px-6 lg:px-8">
          Building your roadmap...
        </main>
      </DashboardLayout>
    );
  }

  if (!roadmap) {
    return (
      <DashboardLayout>
        <PageHeader title="Roadmap" description="A personalized training plan built around your goal." />
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="card p-8">
            <EmptyState
              icon={Compass}
              title="Set up your fitness profile first"
              description="Tell us your goal and experience level in Settings, and we'll build a personalized 4-week roadmap for you."
            />
            <button type="button" onClick={() => navigate('/settings')} className="btn-accent mx-auto mt-5 w-fit">
              Complete your profile
            </button>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const week = roadmap.weeks[activeWeek];

  return (
    <DashboardLayout>
      <PageHeader title="Roadmap" description="A personalized training plan built around your goal." />

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Summary */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-violet-300/60 bg-violet-50 text-violet-700">
                <Target className="h-3 w-3" />
                {roadmap.goalLabel}
              </span>
              <span className="chip border-sky-300/60 bg-sky-50 text-sky-700">
                <TrendingUp className="h-3 w-3" />
                {roadmap.levelLabel}
              </span>
              <span className="chip border-coral-300/60 bg-coral-50 text-coral-700">
                <CalendarRange className="h-3 w-3" />
                {roadmap.daysPerWeek} days / week
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              A 4-week plan matched to your goal and experience level. The exercises stay the same each week — only your
              effort and progression targets change — so it's easy to see yourself getting stronger.
            </p>

            {roadmap.focusAreas.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-energy-50/60 px-4 py-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-energy-600" />
                <p className="text-sm text-ink-700">
                  We noticed you've been training{' '}
                  <span className="font-semibold">{roadmap.focusAreas.join(', ')}</span> less than other muscle groups —
                  this plan gives them a little extra attention.
                </p>
              </div>
            )}
          </div>

          {/* Week timeline */}
          <div className="card overflow-hidden p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
                <CalendarRange className="h-4.5 w-4.5" strokeWidth={2} />
              </span>
              <p className="text-sm font-semibold text-ink-900">4-Week Progression</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {roadmap.weeks.map((w, index) => (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => setActiveWeek(index)}
                  className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                    activeWeek === index
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">Week {w.weekNumber}</p>
                  <p className="mt-0.5 text-sm font-semibold">{w.theme}</p>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-600">{week.note}</p>
          </div>

          {/* Days */}
          <div>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
              This Week's Training Days
            </p>
            <div className="space-y-4">
              {roadmap.days.map((day) => (
                <div key={day.title} className="card overflow-hidden p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{day.title}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {day.muscleGroups.map((group) => (
                          <span key={group} className={`chip ${muscleGroupAccent(group).chip}`}>
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartDay(day, roadmap.levelLabel)}
                      disabled={startingDay === day.title}
                      className="btn-accent shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {startingDay === day.title ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      {startingDay === day.title ? 'Starting...' : 'Start this day'}
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-ink-400">
                          <th className="pb-2 font-semibold">Exercise</th>
                          <th className="pb-2 font-semibold">Muscle group</th>
                          <th className="pb-2 text-right font-semibold">Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {day.exercises.map((exercise) => (
                          <tr key={exercise.exerciseId}>
                            <td className="py-2 font-medium text-ink-800">{exercise.name}</td>
                            <td className="py-2 text-ink-500">{exercise.muscleGroup}</td>
                            <td className="py-2 text-right font-semibold text-ink-900">
                              {exercise.sets} × {exercise.reps}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {startError && (
            <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {startError}
            </p>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
