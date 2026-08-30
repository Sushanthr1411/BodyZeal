import type { Request, Response } from 'express';
import { listExercises, getExerciseById } from '../services/exercise.service';
import { AppError } from '../errors/AppError';
import type { ListExercisesQuery } from '../schemas/exercise.schema';

export async function listExercisesController(req: Request, res: Response) {
  const { muscle, equipment } = req.query as unknown as ListExercisesQuery;
  const exercises = await listExercises({ muscle, equipment });
  res.status(200).json(exercises);
}

export async function getExerciseByIdController(req: Request, res: Response) {
  const id = req.params.id as string; // validated as a string by exerciseIdParamSchema
  const exercise = await getExerciseById(id);
  if (!exercise) throw AppError.notFound(`Exercise "${id}" not found`);
  res.status(200).json(exercise);
}
