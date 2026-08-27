import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createSessionSchema,
  patchSessionSchema,
  logSetSchema,
  sessionIdParamSchema,
  sessionSetIdParamSchema,
} from '../schemas/session.schema';
import {
  getActiveSessionController,
  startSessionController,
  patchSessionController,
  logSetController,
  deleteSetController,
  finishSessionController,
} from '../controllers/session.controller';

export const sessionRouter = Router();

sessionRouter.get('/api/sessions/active', authenticate, getActiveSessionController);
sessionRouter.post('/api/sessions', authenticate, validate({ body: createSessionSchema }), startSessionController);
sessionRouter.patch(
  '/api/sessions/:id',
  authenticate,
  validate({ params: sessionIdParamSchema, body: patchSessionSchema }),
  patchSessionController,
);
sessionRouter.post(
  '/api/sessions/:id/sets',
  authenticate,
  validate({ params: sessionIdParamSchema, body: logSetSchema }),
  logSetController,
);
sessionRouter.delete(
  '/api/sessions/:id/sets/:setId',
  authenticate,
  validate({ params: sessionSetIdParamSchema }),
  deleteSetController,
);
sessionRouter.post(
  '/api/sessions/:id/finish',
  authenticate,
  validate({ params: sessionIdParamSchema }),
  finishSessionController,
);
