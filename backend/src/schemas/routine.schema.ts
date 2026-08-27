import { z } from 'zod';

// Mirrors frontend/src/types/workout.ts's RoutineExercise/Routine shape
// exactly: { exerciseId, plannedSets }, array order IS the intended exercise
// order (no separate orderIndex field on the frontend side — the backend
// persists that ordering explicitly, but the wire shape stays the same).
const routineExerciseInput = z.object({
  exerciseId: z.string().min(1),
  plannedSets: z.number().int().min(1).max(10), // matches CreateRoutinePage.tsx's 1–10 clamp
});

export const routineBodySchema = z
  .object({
    name: z.string().trim().min(1, 'name is required').max(80),
    exercises: z
      .array(routineExerciseInput)
      .min(1, 'a routine needs at least one exercise')
      .max(30)
      .refine((exercises) => new Set(exercises.map((e) => e.exerciseId)).size === exercises.length, {
        message: 'a routine cannot reference the same exercise twice — the frontend UI already prevents this',
      }),
  })
  .strict();

export type RoutineBodyInput = z.infer<typeof routineBodySchema>;

export const routineIdParamSchema = z.object({
  id: z.string().min(1),
});
