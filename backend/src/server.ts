import { env } from './config/env';
import { logger } from './config/logger';
import './config/firebaseAdmin'; // initializes eagerly so a misconfiguration fails at boot, not on first request
import { createApp } from './app';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`BodyZeal backend listening on port ${env.PORT}`, { env: env.NODE_ENV });
});

// Cloud Run sends SIGTERM before stopping/replacing an instance — exit
// cleanly instead of dropping in-flight requests.
function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
