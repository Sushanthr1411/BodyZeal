import { createContext } from 'react';
import type { User } from 'firebase/auth';

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const authContext = createContext<AuthContextValue | undefined>(undefined);
