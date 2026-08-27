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
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral-50 text-coral-600">
            <CalendarRange className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Workout Frequency</p>
            <p className="text-xs text-ink-500">Last {weeks.length} weeks</p>
          </div>
        </div>
        <p className="text-xs font-medium text-ink-600">{activeDays} active days</p>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        <div className="flex flex-col gap-[3px] pt-[18px]">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="grid h-[13px] w-4 place-items-center text-[9px] text-ink-400">
              {i % 2 === 1 ? label : ''}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {wi === 0 && <span className="h-[14px]" />}
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day ? `${day.dateKey}: ${day.count} ${day.count === 1 ? 'workout' : 'workouts'}` : ''}
                  className="h-[13px] w-[13px] rounded-[3px]"
                  style={{ background: day ? intensityColor(day.count) : 'transparent' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-ink-400">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: intensityColor(level) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
