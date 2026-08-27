// Frontend-only persistence for user-created routines (localStorage), mirroring
// recentWorkouts.ts / activeSession.ts. Default routines (data/routines.ts) stay code-defined;
// this only stores what the user builds via the Create Routine screen.
import type { Routine } from '@/types/workout';

const STORAGE_KEY = 'bodyzeal-custom-routines';

export function loadCustomRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomRoutine(routine: Routine) {
  try {
    const current = loadCustomRoutines();
    const next = [...current.filter((existing) => existing.id !== routine.id), routine];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort only
  }
}

export function deleteCustomRoutine(id: string) {
  try {
    const next = loadCustomRoutines().filter((routine) => routine.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort only
  }
}
