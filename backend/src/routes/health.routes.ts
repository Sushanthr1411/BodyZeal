import { Router } from 'express';

export const healthRouter = Router();

// Deliberately does not touch the database — Cloud Run's health/startup
// probe should reflect "is the process up", not "is Postgres reachable".
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
