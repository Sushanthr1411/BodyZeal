import { useContext } from 'react';
import { authContext } from '@/context/auth-context';

export function useAuth() {
  const context = useContext(authContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
