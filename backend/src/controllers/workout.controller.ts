import type { Request, Response } from 'express';
import {
  listFinishedWorkouts,
  getFinishedWorkoutById,
  deleteWorkoutEntry,
  getTodayQuickLog,
  createQuickLog,
  deleteQuickLog,
} from '../services/workout.service';
import { AppError } from '../errors/AppError';
import type { ListWorkoutsQuery, QuickLogInput } from '../schemas/workout.schema';

export async function listWorkoutsController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const { limit } = req.query as unknown as ListWorkoutsQuery;
  const workouts = await listFinishedWorkouts(req.user.uid, limit);
  res.status(200).json(workouts);
}

export async function getWorkoutByIdController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  const workout = await getFinishedWorkoutById(req.user.uid, id);
  res.status(200).json(workout);
}

export async function deleteWorkoutController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  await deleteWorkoutEntry(req.user.uid, id);
  res.status(204).send();
}

export async function getTodayQuickLogController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const entries = await getTodayQuickLog(req.user.uid);
  res.status(200).json(entries);
}

export async function createQuickLogController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const entry = await createQuickLog(req.user.uid, req.body as QuickLogInput);
  res.status(201).json(entry);
}

export async function deleteQuickLogController(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const id = req.params.id as string;
  await deleteQuickLog(req.user.uid, id);
  res.status(204).send();
}
