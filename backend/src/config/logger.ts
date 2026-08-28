import { env } from './env';

// Cloud Run parses stdout as structured logs when each line is a JSON object
// with a `severity` field — it maps straight into Cloud Logging's severity
// filter with no agent to install. In development, plain text is easier to
// read in a terminal, so the two modes diverge deliberately.
type Level = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  if (env.NODE_ENV === 'production') {
    console.log(JSON.stringify({ severity: level, message, ...meta }));
  } else {
    const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
    const line = `[${level}] ${message}${suffix}`;
    if (level === 'ERROR') console.error(line);
    else console.log(line);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write('DEBUG', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write('INFO', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('WARNING', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('ERROR', message, meta),
};
