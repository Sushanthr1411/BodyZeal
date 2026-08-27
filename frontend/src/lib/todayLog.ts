// Frontend-only persistence for the Dashboard's "Log a Set" quick-log widget (localStorage),
// scoped to the current calendar day so it survives reloads without carrying over indefinitely.
import type { WorkoutSet } from '@/types/workout';

const STORAGE_KEY = 'bodyzeal-today-log';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadTodayLog(): WorkoutSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.dateKey !== todayKey() || !Array.isArray(parsed.entries)) return [];
    return parsed.entries as WorkoutSet[];
  } catch {
    return [];
  }
}

export function saveTodayLog(entries: WorkoutSet[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateKey: todayKey(), entries }));
  } catch {
    // best-effort only
  }
}
