import type { Request, Response } from 'express';
import { getActiveSession, startSession, patchSession, logSet, deleteSet, finishSession, discardSession } from '../services/session.service';
import { AppError } from '../errors/AppError';
import type { CreateSessionInput, PatchSessionInput, LogSetInput, FinishSessionInput } from '../schemas/session.schema';

export async function getActiveSessionController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const session = await getActiveSession(req.user.uid);
  res.status(200).json(session);
}

export async function startSessionController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const session = await startSession(req.user.uid, req.body as CreateSessionInput);
  res.status(201).json(session);
}

export async function patchSessionController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const { activeExerciseId } = req.body as PatchSessionInput;
  const session = await patchSession(req.user.uid, id, activeExerciseId);
  res.status(200).json(session);
}

export async function logSetController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const set = await logSet(req.user.uid, id, req.body as LogSetInput);
  res.status(201).json(set);
}

export async function deleteSetController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const setId = req.params.setId as string;
  await deleteSet(req.user.uid, id, setId);
  res.status(204).send();
}

export async function finishSessionController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const { durationSeconds } = req.body as FinishSessionInput;
  const finished = await finishSession(req.user.uid, id, durationSeconds);
  res.status(200).json(finished);
}

export async function discardSessionController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  await discardSession(req.user.uid, id);
  res.status(204).send();
}
