// Backed by the BodyZeal API (GET /api/workouts/today, POST/DELETE
// /api/workouts/quick-log) instead of localStorage. loadTodayLog/addTodayLog
// take over saveTodayLog's old whole-array-sync role — each add/remove is
// now its own call instead of one effect writing the full array on every
// change.
import { api } from '@/lib/apiClient';
import type { WorkoutSet } from '@/types/workout';

export async function loadTodayLog(): Promise<WorkoutSet[]> {
  try {
    return await api.get<WorkoutSet[]>('/api/workouts/today');
  } catch {
    return [];
  }
}

export async function addTodayLogEntry(entry: {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}): Promise<WorkoutSet> {
  return api.post<WorkoutSet>('/api/workouts/quick-log', entry);
}

export async function removeTodayLogEntry(id: string): Promise<void> {
  await api.delete(`/api/workouts/quick-log/${id}`);
}
