import type { MuscleGroup } from '@/types/workout';
import { MUSCLE_GROUP_OPTIONS } from '@/data/exercises';

// Cycles the app's existing accent palette (sky/coral/violet/aqua/energy — same families used
// for chips and charts elsewhere) across the muscle groups, so the library grid reads at a
// glance without inventing new colors or a new taxonomy. Classes are written out in full
// (not built with template strings) so Tailwind's static scanner picks them up.
const ACCENTS = [
  { badge: 'bg-sky-50 text-sky-600', chip: 'border-sky-300/60 bg-sky-50 text-sky-700' },
  { badge: 'bg-coral-50 text-coral-600', chip: 'border-coral-300/60 bg-coral-50 text-coral-700' },
  { badge: 'bg-violet-50 text-violet-600', chip: 'border-violet-300/60 bg-violet-50 text-violet-700' },
  { badge: 'bg-aqua-50 text-aqua-600', chip: 'border-aqua-300/60 bg-aqua-50 text-aqua-700' },
  { badge: 'bg-energy-50 text-energy-600', chip: 'border-energy-300/60 bg-energy-50 text-energy-700' },
] as const;

export function muscleGroupAccent(group: MuscleGroup): { badge: string; chip: string } {
  const index = MUSCLE_GROUP_OPTIONS.indexOf(group);
  return ACCENTS[(index < 0 ? 0 : index) % ACCENTS.length];
}
