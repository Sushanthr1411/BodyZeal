import type { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../config/firebaseAdmin';
import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';

/**
 * Verifies the Firebase ID token on every request, then just-in-time
 * provisions a `User` row keyed by the token's UID. This replaces a
 * signup/login endpoint entirely: Firebase already created the account
 * client-side, so the first authenticated call to ANY endpoint is what
 * creates the matching backend row.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }

  const idToken = header.slice('Bearer '.length).trim();
  if (!idToken) {
    return next(AppError.unauthorized('Missing bearer token'));
  }

  let decoded;
  try {
    decoded = await firebaseAuth.verifyIdToken(idToken);
  } catch (error) {
    logger.warn('Firebase ID token rejected', { reason: error instanceof Error ? error.message : String(error) });
    return next(AppError.unauthorized('Invalid or expired token'));
  }

  const uid = decoded.uid;
  const email = decoded.email ?? null;

  try {
    const existing = await prisma.user.findUnique({ where: { id: uid } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: uid,
          email: email ?? `${uid}@unknown.bodyzeal`, // schema requires a unique, non-null email
          displayName: decoded.name ?? null,
        },
      });
      logger.info('JIT-provisioned new User row', { uid });
    }
  } catch (error) {
    logger.error('User provisioning failed', { uid, error: error instanceof Error ? error.message : String(error) });
    return next(new AppError(500, 'PROVISIONING_FAILED', 'Could not provision user record'));
  }

  req.user = { uid, email };
  next();
}
