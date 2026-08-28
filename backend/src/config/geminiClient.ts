import { GoogleGenAI } from '@google/genai';
import { env } from './env';

// A single client for the process lifetime, exported so tests can monkey-
// patch `gemini.models.generateContent` directly — the same pattern already
// used for `firebaseAuth.verifyIdToken` in src/config/firebaseAdmin.ts.
export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
