import type { UserProfile } from '@/types/profile';

export type BasicProfileErrors = Partial<Record<'fullName' | 'dateOfBirth' | 'gender', string>>;
export type BodyInformationErrors = Partial<Record<'height' | 'weight', string>>;
export type FitnessProfileErrors = Partial<Record<'fitnessGoal' | 'experienceLevel', string>>;

export function validateBasicProfile(
  data: Pick<UserProfile, 'fullName' | 'dateOfBirth' | 'gender'>,
): BasicProfileErrors {
  const errors: BasicProfileErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Enter your full name.';
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Select your date of birth.';
  } else if (new Date(data.dateOfBirth) > new Date()) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  if (!data.gender) {
    errors.gender = 'Select a gender.';
  }

  return errors;
}

export function validateBodyInformation(
  data: Pick<UserProfile, 'height' | 'weight'>,
): BodyInformationErrors {
  const errors: BodyInformationErrors = {};

  if (data.height === null) {
    errors.height = 'Enter your height.';
  } else if (Number.isNaN(data.height) || data.height <= 0) {
    errors.height = 'Height must be a positive number.';
  }

  if (data.weight === null) {
    errors.weight = 'Enter your weight.';
  } else if (Number.isNaN(data.weight) || data.weight <= 0) {
    errors.weight = 'Weight must be a positive number.';
  }

  return errors;
}

export function validateFitnessProfile(
  data: Pick<UserProfile, 'fitnessGoal' | 'experienceLevel'>,
): FitnessProfileErrors {
  const errors: FitnessProfileErrors = {};

  if (!data.fitnessGoal) {
    errors.fitnessGoal = 'Select a fitness goal.';
  }

  if (!data.experienceLevel) {
    errors.experienceLevel = 'Select your experience level.';
  }

  return errors;
}
