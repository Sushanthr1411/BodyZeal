// Backed by the BodyZeal API (GET/POST/DELETE /api/routines) instead of
// localStorage. Backend returns system defaults + the user's own custom
// routines in one list (isSystemDefault flag) — loadCustomRoutines() filters
// down to just the custom ones so every existing caller (which expects a
// "customRoutines" array separate from the static default ROUTINES) keeps
// working unchanged.
import { api, ApiError } from '@/lib/apiClient';
import type { Routine } from '@/types/workout';

type ApiRoutine = Routine & { isSystemDefault: boolean };

export async function loadCustomRoutines(): Promise<Routine[]> {
  try {
    const all = await api.get<ApiRoutine[]>('/api/routines');
    return all.filter((r) => !r.isSystemDefault).map(({ id, name, exercises }) => ({ id, name, exercises }));
  } catch {
    return [];
  }
}

export async function saveCustomRoutine(routine: Routine): Promise<Routine> {
  // The backend assigns the id — the client-generated one on `routine` (from
  // CreateRoutinePage's slug+timestamp) is only ever used before this call
  // resolves, so it's fine to drop here.
  const created = await api.post<ApiRoutine>('/api/routines', {
    name: routine.name,
    exercises: routine.exercises,
  });
  return { id: created.id, name: created.name, exercises: created.exercises };
}

/** Throws ApiError with code 'CONFLICT' (409) if the routine has workout
 * history and can't be deleted — callers should catch and show that. */
export async function deleteCustomRoutine(id: string): Promise<void> {
  await api.delete(`/api/routines/${id}`);
}

export { ApiError };
