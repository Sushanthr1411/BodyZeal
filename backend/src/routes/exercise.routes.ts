import { Router } from 'express';
import { validate } from '../middleware/validate';
import { listExercisesQuerySchema, exerciseIdParamSchema } from '../schemas/exercise.schema';
import { listExercisesController, getExerciseByIdController } from '../controllers/exercise.controller';

export const exerciseRouter = Router();

// Reference data, not user-specific — no `authenticate` needed.
exerciseRouter.get('/api/exercises', validate({ query: listExercisesQuerySchema }), listExercisesController);
exerciseRouter.get('/api/exercises/:id', validate({ params: exerciseIdParamSchema }), getExerciseByIdController);
