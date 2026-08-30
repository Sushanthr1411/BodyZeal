// Backed by the BodyZeal API (GET /api/workouts/today, POST /api/workouts/quick-log)
// instead of localStorage. Deleting a quick-logged entry is deliberately not exposed
// here — that only happens from the Exercise History page (DELETE /api/workouts/:id,
// which recognizes a quick-log id as well as a session id), so a wrongly-logged set
// still shows up in Today's Activity as a nudge to go fix it there, and every removal
// path stays in one place instead of two independently-maintained ones.
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
