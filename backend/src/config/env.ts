import { z } from 'zod';

// Fails fast on boot if required configuration is missing — the alternative
// is finding out mid-request in production, from a confusing downstream error.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  // Optional (not required to boot) — the "Need Help?" contact form 500s with a
  // clear error at send-time if these are unset, rather than blocking startup
  // for every deployment that hasn't configured outbound email yet.
  SUPPORT_EMAIL_USER: z.string().optional(),
  SUPPORT_EMAIL_APP_PASSWORD: z.string().optional(),
  SUPPORT_EMAIL_TO: z.string().optional(),
  FRONTEND_ORIGINS: z
    .string()
    .min(1, 'FRONTEND_ORIGINS is required')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

export type Env = {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  GEMINI_API_KEY: string;
  SUPPORT_EMAIL_USER?: string;
  SUPPORT_EMAIL_APP_PASSWORD?: string;
  SUPPORT_EMAIL_TO?: string;
  FRONTEND_ORIGINS: string[];
};

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
