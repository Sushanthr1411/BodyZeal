import type { WorkoutSet } from '@/types/workout';

export function calcVolume(sets: number, reps: number, weight: number): number {
  return sets * reps * weight;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return String(volume);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function groupSetsByExercise(entries: WorkoutSet[]): { exerciseName: string; sets: WorkoutSet[]; volume: number }[] {
  const order: string[] = [];
  const byExercise = new Map<string, WorkoutSet[]>();
  for (const entry of entries) {
    if (!byExercise.has(entry.exerciseName)) {
      byExercise.set(entry.exerciseName, []);
      order.push(entry.exerciseName);
    }
    byExercise.get(entry.exerciseName)!.push(entry);
  }
  return order.map((exerciseName) => {
    const sets = byExercise.get(exerciseName)!;
    return { exerciseName, sets, volume: sets.reduce((total, set) => total + set.volume, 0) };
  });
}
