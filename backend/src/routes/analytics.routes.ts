import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  volumeByDayQuerySchema,
  muscleGroupSplitQuerySchema,
  frequencyQuerySchema,
  exerciseProgressQuerySchema,
  analyticsExerciseIdParamSchema,
} from '../schemas/analytics.schema';
import {
  getSummaryController,
  getVolumeByDayController,
  getMuscleGroupSplitController,
  getFrequencyController,
  getStreakController,
  getHistoryByDateController,
  getLoggedExercisesController,
  getExerciseProgressController,
  getExerciseStatsController,
} from '../controllers/analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.get('/api/analytics/summary', authenticate, getSummaryController);
analyticsRouter.get(
  '/api/analytics/volume-by-day',
  authenticate,
  validate({ query: volumeByDayQuerySchema }),
  getVolumeByDayController,
);
analyticsRouter.get(
  '/api/analytics/muscle-group-split',
  authenticate,
  validate({ query: muscleGroupSplitQuerySchema }),
  getMuscleGroupSplitController,
);
analyticsRouter.get(
  '/api/analytics/frequency',
  authenticate,
  validate({ query: frequencyQuerySchema }),
  getFrequencyController,
);
analyticsRouter.get('/api/analytics/streak', authenticate, getStreakController);
analyticsRouter.get('/api/analytics/history-by-date', authenticate, getHistoryByDateController);
analyticsRouter.get('/api/analytics/exercises/logged', authenticate, getLoggedExercisesController);
analyticsRouter.get(
  '/api/analytics/exercises/:exerciseId/progress',
  authenticate,
  validate({ params: analyticsExerciseIdParamSchema, query: exerciseProgressQuerySchema }),
  getExerciseProgressController,
);
analyticsRouter.get(
  '/api/analytics/exercises/:exerciseId/stats',
  authenticate,
  validate({ params: analyticsExerciseIdParamSchema }),
  getExerciseStatsController,
);
