import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health.routes';
import { profileRouter } from './routes/profile.routes';
import { exerciseRouter } from './routes/exercise.routes';
import { routineRouter } from './routes/routine.routes';
import { sessionRouter } from './routes/session.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGINS,
      credentials: false, // bearer token auth, not cookies — no credentialed CORS needed
    }),
  );
  app.use(express.json());
  app.use(requestLogger);

  app.use(healthRouter);
  app.use(profileRouter);
  app.use(exerciseRouter);
  app.use(routineRouter);
  app.use(sessionRouter);

  // Remaining business routes (workout history/quick-log, dashboard,
  // analytics) come after Phase 3C approval.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
