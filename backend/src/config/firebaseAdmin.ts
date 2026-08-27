import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from './logger';

// No explicit credential is passed: on Cloud Run, the SDK resolves Application
// Default Credentials from the service's attached identity automatically;
// locally, it reads GOOGLE_APPLICATION_CREDENTIALS if set. Either way this is
// the SAME Firebase project the frontend already authenticates against
// (FIREBASE_PROJECT_ID must equal the frontend's VITE_FIREBASE_PROJECT_ID) —
// verifyIdToken() rejects tokens issued for any other project.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: env.FIREBASE_PROJECT_ID,
  });
  logger.info('Firebase Admin initialized', { projectId: env.FIREBASE_PROJECT_ID });
}

export const firebaseAuth = admin.auth();
