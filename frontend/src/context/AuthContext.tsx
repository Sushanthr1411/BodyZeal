import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
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

  // Firebase's own password-reset flow: the emailed link lands on a Firebase-hosted
  // page (or a custom one, if an action URL is configured in the Firebase console)
  // that calls confirmPasswordReset — the new password is written straight to
  // Firebase Authentication, the only place this app's passwords are ever stored.
  async function resetPassword(email: string) {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <authContext.Provider value={{ user, loading, login, signup, logout, resetPassword }}>
      {children}
    </authContext.Provider>
  );
}
