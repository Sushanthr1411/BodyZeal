import { z } from 'zod';
import { logSetSchema } from './session.schema';

// A quick-log entry is exactly the same shape as logging a set inside a
// session — {exerciseId, sets, reps, weight} — the only difference is it
// never gets a sessionId. Reusing the schema keeps the two write paths from
// silently drifting apart.
export const quickLogSchema = logSetSchema;
export type QuickLogInput = z.infer<typeof quickLogSchema>;

export const listWorkoutsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(60), // 60 matches recentWorkouts.ts's MAX_ENTRIES cap
});
export type ListWorkoutsQuery = z.infer<typeof listWorkoutsQuerySchema>;

export const workoutIdParamSchema = z.object({ id: z.string().min(1) });
export const quickLogIdParamSchema = z.object({ id: z.string().min(1) });
