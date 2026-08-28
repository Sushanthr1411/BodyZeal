import type { Request, Response } from 'express';
import { getProfile, upsertProfile } from '../services/profile.service';
import { AppError } from '../errors/AppError';
import type { UpdateProfileInput } from '../schemas/profile.schema';

export async function getProfileController(req: Request, res: Response) {
  // req.user is guaranteed by the `authenticate` middleware that runs before
  // this controller — the UID always comes from the verified token, never
  // from a client-supplied param, so one user can never read another's data.
  if (!req.user) throw AppError.unauthorized();

  const profile = await getProfile(req.user.uid);
  res.status(200).json(profile);
}

export async function putProfileController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();

  const patch = req.body as UpdateProfileInput;
  const profile = await upsertProfile(req.user.uid, patch);
  res.status(200).json(profile);
}
