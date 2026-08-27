import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { routineBodySchema, routineIdParamSchema } from '../schemas/routine.schema';
import {
  listRoutinesController,
  createRoutineController,
  updateRoutineController,
  deleteRoutineController,
} from '../controllers/routine.controller';

export const routineRouter = Router();

routineRouter.get('/api/routines', authenticate, listRoutinesController);
routineRouter.post('/api/routines', authenticate, validate({ body: routineBodySchema }), createRoutineController);
routineRouter.put(
  '/api/routines/:id',
  authenticate,
  validate({ params: routineIdParamSchema, body: routineBodySchema }),
  updateRoutineController,
);
routineRouter.delete(
  '/api/routines/:id',
  authenticate,
  validate({ params: routineIdParamSchema }),
  deleteRoutineController,
);
