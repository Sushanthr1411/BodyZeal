import type { Request, Response } from 'express';
import { sendSupportMessage } from '../services/support.service';
import { AppError } from '../errors/AppError';
import type { ContactSupportInput } from '../schemas/support.schema';

export async function contactSupportController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await sendSupportMessage(req.user.email, req.body as ContactSupportInput);
  res.status(204).send();
}
