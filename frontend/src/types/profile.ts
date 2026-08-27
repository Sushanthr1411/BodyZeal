export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type HeightUnit = 'cm';

export type WeightUnit = 'kg';

export type FitnessGoal = 'build_muscle' | 'lose_weight' | 'maintain_fitness';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Canonical shape of a user's profile. Onboarding fills this in locally today;
 * the persistence layer (Firestore + Firebase UID) is expected to adopt this
 * same interface later rather than introduce a second profile model.
 */
export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  gender: Gender | null;
  profilePhoto: string | null;
  height: number | null;
  heightUnit: HeightUnit;
  weight: number | null;
  weightUnit: WeightUnit;
  fitnessGoal: FitnessGoal | null;
  experienceLevel: ExperienceLevel | null;
}

export const EMPTY_PROFILE: UserProfile = {
  fullName: '',
  dateOfBirth: '',
  gender: null,
  profilePhoto: null,
  height: null,
  heightUnit: 'cm',
  weight: null,
  weightUnit: 'kg',
  fitnessGoal: null,
  experienceLevel: null,
};

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const FITNESS_GOAL_OPTIONS: { value: FitnessGoal; label: string; description: string }[] = [
  { value: 'build_muscle', label: 'Build Muscle', description: 'Grow strength and size over time' },
  { value: 'lose_weight', label: 'Lose Weight', description: 'Trim down with consistent training' },
  { value: 'maintain_fitness', label: 'Maintain Fitness', description: 'Stay active and hold steady' },
];

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
  { value: 'intermediate', label: 'Intermediate', description: 'Training consistently for a while' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced with programming and technique' },
];
