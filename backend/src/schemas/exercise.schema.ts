import { z } from 'zod';
import { Equipment, MuscleGroup } from '@prisma/client';

// URL-friendly slugs (?muscle=biceps, ?equipment=barbell_rod) mapped straight
// to the Prisma enum — lowercased enum names, multi-word ones underscored.
const MUSCLE_SLUG_TO_ENUM: Record<string, MuscleGroup> = {
  chest: MuscleGroup.CHEST,
  back: MuscleGroup.BACK,
  shoulders: MuscleGroup.SHOULDERS,
  biceps: MuscleGroup.BICEPS,
  triceps: MuscleGroup.TRICEPS,
  forearms: MuscleGroup.FOREARMS,
  legs: MuscleGroup.LEGS,
  glutes: MuscleGroup.GLUTES,
  abs_core: MuscleGroup.ABS_CORE,
  calves: MuscleGroup.CALVES,
};

const EQUIPMENT_SLUG_TO_ENUM: Record<string, Equipment> = {
  dumbbell: Equipment.DUMBBELL,
  kettlebell: Equipment.KETTLEBELL,
  barbell_rod: Equipment.BARBELL_ROD,
  resistance_band: Equipment.RESISTANCE_BAND,
  cable_machine: Equipment.CABLE_MACHINE,
  machine: Equipment.MACHINE,
  bodyweight: Equipment.BODYWEIGHT,
};

/** Builds a Zod schema that lowercases a raw query string, validates it against
 * the slug map's keys, and transforms it straight to the matching Prisma enum
 * value — an invalid slug fails validation with the allowed list in the error. */
function slugSchema<T extends string>(map: Record<string, T>) {
  const slugs = Object.keys(map) as [string, ...string[]];
  return z.preprocess(
    (value) => (typeof value === 'string' ? value.toLowerCase() : value),
    z.enum(slugs, { errorMap: () => ({ message: `must be one of: ${slugs.join(', ')}` }) }),
  ).transform((slug) => map[slug]!);
}

export const listExercisesQuerySchema = z.object({
  muscle: slugSchema(MUSCLE_SLUG_TO_ENUM).optional(),
  equipment: slugSchema(EQUIPMENT_SLUG_TO_ENUM).optional(),
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;

export const exerciseIdParamSchema = z.object({
  id: z.string().min(1),
});
