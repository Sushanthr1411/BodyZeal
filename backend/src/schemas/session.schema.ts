import { z } from 'zod';

export const createSessionSchema = z
  .object({
    routineId: z.string().min(1).nullable().optional(),
    name: z.string().trim().min(1, 'name is required').max(120),
  })
  .strict();
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const patchSessionSchema = z
  .object({
    activeExerciseId: z.string().min(1).nullable(),
  })
  .strict();
export type PatchSessionInput = z.infer<typeof patchSessionSchema>;

// sets/reps/weight bounds mirror WorkoutEntryCard.tsx's own form validation
// (positive integers for sets/reps, positive number for weight); volume is
// never accepted from the client — the backend always computes it.
export const logSetSchema = z
  .object({
    exerciseId: z.string().min(1),
    sets: z.number().int().min(1).max(20),
    reps: z.number().int().min(1).max(100),
    weight: z.number().positive().max(1000),
  })
  .strict();
export type LogSetInput = z.infer<typeof logSetSchema>;

export const sessionIdParamSchema = z.object({ id: z.string().min(1) });
export const sessionSetIdParamSchema = z.object({ id: z.string().min(1), setId: z.string().min(1) });
