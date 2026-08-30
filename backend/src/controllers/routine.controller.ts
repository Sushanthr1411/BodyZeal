import type { Request, Response } from 'express';
import { listRoutines, createRoutine, updateRoutine, deleteRoutine } from '../services/routine.service';
import { AppError } from '../errors/AppError';
import type { RoutineBodyInput } from '../schemas/routine.schema';

export async function listRoutinesController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const routines = await listRoutines(req.user.uid);
  res.status(200).json(routines);
}

export async function createRoutineController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const routine = await createRoutine(req.user.uid, req.body as RoutineBodyInput);
  res.status(201).json(routine);
}

export async function updateRoutineController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const routine = await updateRoutine(req.user.uid, id, req.body as RoutineBodyInput);
  res.status(200).json(routine);
}

export async function deleteRoutineController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  await deleteRoutine(req.user.uid, id);
  res.status(204).send();
}
