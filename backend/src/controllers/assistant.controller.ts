import type { Request, Response } from 'express';
import { getAssistantReply } from '../services/assistant.service';
import { AppError } from '../errors/AppError';
import type { ChatInput } from '../schemas/assistant.schema';

export async function chatController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const result = await getAssistantReply(req.user.uid, req.body as ChatInput);
  res.status(200).json(result);
}
