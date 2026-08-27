import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { authContext } from '@/context/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string, remember = true) {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email: string, password: string, displayName?: string) {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    }
  }

  async function logout() {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    await signOut(auth);
  }

  return (
    <authContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </authContext.Provider>
  );
}
