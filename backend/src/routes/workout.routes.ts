import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  listWorkoutsQuerySchema,
  workoutIdParamSchema,
  quickLogSchema,
  quickLogIdParamSchema,
} from '../schemas/workout.schema';
import {
  listWorkoutsController,
  getWorkoutByIdController,
  getTodayQuickLogController,
  createQuickLogController,
  deleteQuickLogController,
} from '../controllers/workout.controller';

export const workoutRouter = Router();

// Static segments ('today', 'quick-log') are registered before the
// '/:id' route below so Express matches them literally instead of
// swallowing them as an id param.
workoutRouter.get('/api/workouts/today', authenticate, getTodayQuickLogController);
workoutRouter.post('/api/workouts/quick-log', authenticate, validate({ body: quickLogSchema }), createQuickLogController);
workoutRouter.delete(
  '/api/workouts/quick-log/:id',
  authenticate,
  validate({ params: quickLogIdParamSchema }),
  deleteQuickLogController,
);

workoutRouter.get('/api/workouts', authenticate, validate({ query: listWorkoutsQuerySchema }), listWorkoutsController);
workoutRouter.get('/api/workouts/:id', authenticate, validate({ params: workoutIdParamSchema }), getWorkoutByIdController);
