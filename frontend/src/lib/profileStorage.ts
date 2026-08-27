import type { UserProfile } from '@/types/profile';
import { EMPTY_PROFILE } from '@/types/profile';

function storageKey(uid: string) {
  return `bodyzeal-profile-${uid}`;
}

export function loadProfile(uid: string): UserProfile {
  try {
    const saved = localStorage.getItem(storageKey(uid));
    if (!saved) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...JSON.parse(saved) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function saveProfile(uid: string, profile: UserProfile) {
  localStorage.setItem(storageKey(uid), JSON.stringify(profile));
}
