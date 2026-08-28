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
import { workoutRouter } from './routes/workout.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { assistantRouter } from './routes/assistant.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // FRONTEND_ORIGINS is the sole source of truth in production — a
      // request from any other origin is rejected there, full stop. In
      // development only, any http://localhost:<port> is also allowed:
      // Vite auto-increments its port whenever the previous one is still
      // occupied (a stale dev server left running), so hardcoding one exact
      // port in .env is fragile and breaks CORS every time that happens.
      // This never applies outside development, and never allows a
      // non-localhost origin regardless of environment.
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // same-origin / non-browser clients (curl, tests) send no Origin header
        if (env.FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
        if (env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
        return callback(new Error(`Origin "${origin}" is not allowed by CORS`));
      },
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
  app.use(workoutRouter);
  app.use(analyticsRouter);
  app.use(assistantRouter);

  // Frontend wiring and GCP deployment come after Phase 3F approval.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
