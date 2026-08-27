// Backed by the BodyZeal API (GET/PUT /api/profile) instead of localStorage.
// Same function names and the same always-a-full-UserProfile contract as
// before — loadProfile never returns null, it merges the backend's response
// (which is null pre-onboarding, and uses null for individual unset fields)
// over EMPTY_PROFILE, exactly like the old localStorage version did.
import { api } from '@/lib/apiClient';
import { EMPTY_PROFILE, type UserProfile } from '@/types/profile';

type ApiProfile = {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: UserProfile['gender'];
  profilePhoto: string | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: UserProfile['fitnessGoal'];
  experienceLevel: UserProfile['experienceLevel'];
} | null;

function fromApi(apiProfile: ApiProfile): UserProfile {
  if (!apiProfile) return { ...EMPTY_PROFILE };
  return {
    ...EMPTY_PROFILE,
    fullName: apiProfile.fullName ?? '',
    dateOfBirth: apiProfile.dateOfBirth ?? '',
    gender: apiProfile.gender,
    profilePhoto: apiProfile.profilePhoto,
    height: apiProfile.height,
    weight: apiProfile.weight,
    fitnessGoal: apiProfile.fitnessGoal,
    experienceLevel: apiProfile.experienceLevel,
  };
}

export async function loadProfile(_uid: string): Promise<UserProfile> {
  try {
    const apiProfile = await api.get<ApiProfile>('/api/profile');
    return fromApi(apiProfile);
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export async function saveProfile(_uid: string, profile: UserProfile): Promise<UserProfile> {
  const apiProfile = await api.put<ApiProfile>('/api/profile', {
    fullName: profile.fullName || null,
    dateOfBirth: profile.dateOfBirth || null,
    gender: profile.gender,
    profilePhoto: profile.profilePhoto,
    height: profile.height,
    weight: profile.weight,
    fitnessGoal: profile.fitnessGoal,
    experienceLevel: profile.experienceLevel,
  });
  return fromApi(apiProfile);
}
