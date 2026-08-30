import { CalendarRange } from 'lucide-react';
import type { FrequencyDay } from '@/utils/analytics';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function intensityColor(count: number): string {
  if (count <= 0) return '#E1D9C7';
  if (count === 1) return '#D3E68C';
  if (count === 2) return '#9FC232';
  return '#526615';
}

type FrequencyHeatmapProps = {
  data: FrequencyDay[];
};

export default function FrequencyHeatmap({ data }: FrequencyHeatmapProps) {
  // Pad the front so the first column starts on Sunday, then chunk into week columns.
  const padded: (FrequencyDay | null)[] = data.length > 0
    ? [...Array(data[0].dayOfWeek).fill(null), ...data]
    : [];
  const weeks: (FrequencyDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-coral-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
            <CalendarRange className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink-900">Workout Frequency</p>
            <p className="mt-0.5 truncate text-sm text-ink-500">Last {weeks.length} weeks</p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-medium text-ink-600">{activeDays} active days</p>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        <div className="flex flex-col gap-[6px] pt-[32px]">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="grid h-[22px] w-6 place-items-center text-xs font-medium text-ink-400">
              {i % 2 === 1 ? label : ''}
            </span>
          ))}
        </div>
        <div className="flex gap-[6px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[6px]">
              {wi === 0 && <span className="h-[26px]" />}
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day ? `${day.dateKey}: ${day.count} ${day.count === 1 ? 'workout' : 'workouts'}` : ''}
                  className="h-[22px] w-[22px] rounded-[5px] transition-transform hover:scale-110"
                  style={{ background: day ? intensityColor(day.count) : 'transparent' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-ink-400">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className="h-[16px] w-[16px] rounded-[4px]" style={{ background: intensityColor(level) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
