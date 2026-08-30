import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Trophy } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { exerciseProgress, loggedExerciseNames, personalRecord } from '@/utils/analytics';
import EmptyState from '@/components/common/EmptyState';
import Dropdown from '@/components/common/Dropdown';

type ExerciseProgressChartProps = {
  history: RecentWorkout[];
};

export default function ExerciseProgressChart({ history }: ExerciseProgressChartProps) {
  const exerciseNames = loggedExerciseNames(history);
  const [selected, setSelected] = useState<string | null>(null);
  const activeExercise = selected && exerciseNames.includes(selected) ? selected : exerciseNames[0] ?? null;

  const points = activeExercise ? exerciseProgress(history, activeExercise) : [];
  const pr = activeExercise ? personalRecord(history, activeExercise) : null;

  return (
    <div className="card relative p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
            <Trophy className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">Progress &amp; Personal Records</p>
            <p className="mt-0.5 truncate text-xs text-ink-500">Top weight per session</p>
          </div>
        </div>

        {exerciseNames.length > 0 && activeExercise && (
          <div className="w-48 shrink-0">
            <Dropdown
              label="Exercise"
              showLabel={false}
              value={activeExercise}
              onChange={setSelected}
              accentClassName="text-violet-500"
              buttonClassName="py-2 text-sm"
              options={exerciseNames.map((name) => ({ value: name, label: name }))}
            />
          </div>
        )}
      </div>

      {exerciseNames.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Trophy}
            title="No progress yet"
            description="Once you finish workouts, pick an exercise here to track your top weight over time."
          />
        </div>
      ) : (
        <>
          {pr && (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-ink-50 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Best weight</p>
                <p className="mt-1 font-display text-xl font-700 text-ink-900">{pr.maxWeight} kg</p>
              </div>
              <div className="rounded-xl bg-ink-50 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Best session volume</p>
                <p className="mt-1 font-display text-xl font-700 text-ink-900">{pr.maxVolumeSession.toLocaleString()} kg</p>
              </div>
            </div>
          )}

          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E1D9C7" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#83765A' }} width={34} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E1D9C7', fontSize: 12, boxShadow: '0 8px 24px -12px rgba(29,24,17,0.2)' }}
                  labelStyle={{ color: '#1D1811', fontWeight: 600, marginBottom: 2 }}
                  formatter={(value) => [`${Number(value)} kg`, 'Top weight']}
                />
                <Line
                  type="monotone"
                  dataKey="topWeight"
                  stroke="#8F4F7E"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#8F4F7E', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
