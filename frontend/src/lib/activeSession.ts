// Backed by the BodyZeal API (Phase 3C session endpoints) instead of a single
// localStorage snapshot. The old model wrote the ENTIRE session on every
// state change (routine, roster, planned sets, active exercise, all entries)
// in one blob; there is no server equivalent to that, and there shouldn't
// be — each of these is now its own targeted call, matching the granularity
// the backend actually persists at:
//   start          -> POST /api/sessions
//   resume         -> GET  /api/sessions/active
//   switch exercise -> PATCH /api/sessions/:id
//   log a set      -> POST /api/sessions/:id/sets   (ONE aggregate row per
//                      call — Phase 3C's agreed semantics; this does NOT
//                      explode "3 sets" into 3 rows the way the old
//                      localStorage version did)
//   remove a set   -> DELETE /api/sessions/:id/sets/:setId
//   finish         -> POST /api/sessions/:id/finish
import { api } from '@/lib/apiClient';
import type { Exercise, WorkoutSet } from '@/types/workout';
import type { PlannedSetsMap } from '@/utils/routine';
import type { RecentWorkout } from '@/lib/recentWorkouts';

export type ActiveSessionSnapshot = {
  id: string;
  routineId: string | null;
  workoutName: string;
  startedAt: number;
  exercises: Exercise[];
  plannedSets: PlannedSetsMap;
  activeExerciseId: string | null;
  entries: WorkoutSet[];
};

export async function loadActiveSession(): Promise<ActiveSessionSnapshot | null> {
  try {
    return await api.get<ActiveSessionSnapshot | null>('/api/sessions/active');
  } catch {
    return null;
  }
}

export async function startSession(input: { routineId: string | null; name: string }): Promise<ActiveSessionSnapshot> {
  return api.post<ActiveSessionSnapshot>('/api/sessions', input);
}

export async function setActiveExercise(sessionId: string, activeExerciseId: string | null): Promise<ActiveSessionSnapshot> {
  return api.patch<ActiveSessionSnapshot>(`/api/sessions/${sessionId}`, { activeExerciseId });
}

export async function logSessionSet(
  sessionId: string,
  input: { exerciseId: string; sets: number; reps: number; weight: number },
): Promise<WorkoutSet> {
  return api.post<WorkoutSet>(`/api/sessions/${sessionId}/sets`, input);
}

export async function removeSessionSet(sessionId: string, setId: string): Promise<void> {
  await api.delete(`/api/sessions/${sessionId}/sets/${setId}`);
}

export async function finishSession(sessionId: string): Promise<RecentWorkout> {
  return api.post<RecentWorkout>(`/api/sessions/${sessionId}/finish`);
}
