import { Gender, ExperienceLevel, FitnessGoal, type UserProfile as UserProfileRow, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import type { UpdateProfileInput } from '../schemas/profile.schema';

// Mirrors frontend/src/types/profile.ts exactly — the frontend gets back the
// same shape it already knows how to render, just sourced from the DB now.
export type ProfileResponse = {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'prefer_not_to_say' | null;
  profilePhoto: string | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: 'build_muscle' | 'lose_weight' | 'maintain_fitness' | null;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
};

const GENDER_OUT: Record<Gender, NonNullable<ProfileResponse['gender']>> = {
  [Gender.MALE]: 'male',
  [Gender.FEMALE]: 'female',
  [Gender.PREFER_NOT_TO_SAY]: 'prefer_not_to_say',
};
const GENDER_IN: Record<NonNullable<ProfileResponse['gender']>, Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
  prefer_not_to_say: Gender.PREFER_NOT_TO_SAY,
};

const FITNESS_GOAL_OUT: Record<FitnessGoal, NonNullable<ProfileResponse['fitnessGoal']>> = {
  [FitnessGoal.BUILD_MUSCLE]: 'build_muscle',
  [FitnessGoal.LOSE_WEIGHT]: 'lose_weight',
  [FitnessGoal.MAINTAIN_FITNESS]: 'maintain_fitness',
};
const FITNESS_GOAL_IN: Record<NonNullable<ProfileResponse['fitnessGoal']>, FitnessGoal> = {
  build_muscle: FitnessGoal.BUILD_MUSCLE,
  lose_weight: FitnessGoal.LOSE_WEIGHT,
  maintain_fitness: FitnessGoal.MAINTAIN_FITNESS,
};

const EXPERIENCE_LEVEL_OUT: Record<ExperienceLevel, NonNullable<ProfileResponse['experienceLevel']>> = {
  [ExperienceLevel.BEGINNER]: 'beginner',
  [ExperienceLevel.INTERMEDIATE]: 'intermediate',
  [ExperienceLevel.ADVANCED]: 'advanced',
};
const EXPERIENCE_LEVEL_IN: Record<NonNullable<ProfileResponse['experienceLevel']>, ExperienceLevel> = {
  beginner: ExperienceLevel.BEGINNER,
  intermediate: ExperienceLevel.INTERMEDIATE,
  advanced: ExperienceLevel.ADVANCED,
};

function toProfileResponse(row: UserProfileRow): ProfileResponse {
  return {
    fullName: row.fullName,
    dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString().slice(0, 10) : null,
    gender: row.gender ? GENDER_OUT[row.gender] : null,
    profilePhoto: row.profilePhotoUrl,
    height: row.heightCm,
    weight: row.weightKg,
    fitnessGoal: row.fitnessGoal ? FITNESS_GOAL_OUT[row.fitnessGoal] : null,
    experienceLevel: row.experienceLevel ? EXPERIENCE_LEVEL_OUT[row.experienceLevel] : null,
  };
}

/**
 * Returns null when the user hasn't completed onboarding yet — mirrors
 * profileStorage.ts's loadProfile(), which also returns null for "no
 * profile saved yet" rather than a default object.
 */
export async function getProfile(userId: string): Promise<ProfileResponse | null> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return profile ? toProfileResponse(profile) : null;
}

/**
 * Partial merge-update, upserting on first save (onboarding) and updating
 * thereafter (settings page). Only keys actually present in `patch` are
 * written — an omitted field leaves the stored value untouched; an explicit
 * `null` clears it. Both branches of the upsert build off the same `data`
 * object so create and update can never drift apart.
 */
export async function upsertProfile(userId: string, patch: UpdateProfileInput): Promise<ProfileResponse> {
  const data: Prisma.UserProfileUncheckedCreateInput = { userId };

  if ('fullName' in patch) data.fullName = patch.fullName ?? null;
  if ('dateOfBirth' in patch) data.dateOfBirth = patch.dateOfBirth ? new Date(patch.dateOfBirth) : null;
  if ('gender' in patch) data.gender = patch.gender ? GENDER_IN[patch.gender] : null;
  if ('profilePhoto' in patch) data.profilePhotoUrl = patch.profilePhoto ?? null;
  if ('height' in patch) data.heightCm = patch.height ?? null;
  if ('weight' in patch) data.weightKg = patch.weight ?? null;
  if ('fitnessGoal' in patch) data.fitnessGoal = patch.fitnessGoal ? FITNESS_GOAL_IN[patch.fitnessGoal] : null;
  if ('experienceLevel' in patch)
    data.experienceLevel = patch.experienceLevel ? EXPERIENCE_LEVEL_IN[patch.experienceLevel] : null;

  const { userId: _userId, ...updateData } = data;
  const row = await prisma.userProfile.upsert({
    where: { userId },
    create: data,
    update: updateData,
  });
  return toProfileResponse(row);
}
