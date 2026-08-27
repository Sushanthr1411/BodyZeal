import { PrismaClient } from '@prisma/client';
import { env } from './env';

// A single client for the process lifetime. Deliberately NOT connected here —
// Prisma connects lazily on first query, so a missing/unreachable DATABASE_URL
// doesn't stop the server from starting or /health from responding.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
