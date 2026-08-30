import { z } from 'zod';

// Defaults mirror the frontend utility functions' own defaults exactly
// (frontend/src/utils/analytics.ts: volumeByDay days=7, frequencyGrid weeks=8) —
// AnalyticsSection.tsx calls them with explicit 7 and 20 respectively; both
// are just callers overriding these same defaults via query params here.
export const volumeByDayQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const muscleGroupSplitQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(), // omitted = all-time, matching muscleGroupBreakdown(history)
});

export const frequencyQuerySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(52).default(8),
});

// Matches ExerciseDetailPage.tsx's RANGES exactly: 7d/30d/3m/all, default '30d'.
export const exerciseProgressQuerySchema = z.object({
  range: z.enum(['7d', '30d', '3m', 'all']).default('30d'),
});

export const analyticsExerciseIdParamSchema = z.object({
  exerciseId: z.string().min(1),
});
