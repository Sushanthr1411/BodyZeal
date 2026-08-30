import { z } from 'zod';

// Mirrors frontend/src/types/profile.ts. Every field is optional (a PUT here
// is a partial merge, matching how the onboarding wizard/settings page save
// one step at a time) but `.strict()` rejects unknown fields outright rather
// than silently dropping them.
export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1, 'fullName cannot be blank').max(120).nullable().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be an ISO date (YYYY-MM-DD)')
      .nullable()
      .optional(),
    gender: z.enum(['male', 'female', 'prefer_not_to_say']).nullable().optional(),
    profilePhoto: z.string().max(5_000_000, 'profilePhoto is too large').nullable().optional(),
    height: z.number().positive('height must be a positive number').max(300).nullable().optional(),
    weight: z.number().positive('weight must be a positive number').max(500).nullable().optional(),
    fitnessGoal: z.enum(['build_muscle', 'lose_weight', 'maintain_fitness']).nullable().optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullable().optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
