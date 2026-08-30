import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';
import type { ContactSupportInput } from '../schemas/support.schema';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.SUPPORT_EMAIL_USER || !env.SUPPORT_EMAIL_APP_PASSWORD) {
    throw new AppError(
      503,
      'EMAIL_NOT_CONFIGURED',
      "Support email isn't set up on this server yet — SUPPORT_EMAIL_USER / SUPPORT_EMAIL_APP_PASSWORD are unset.",
    );
  }
  // Built once and reused — nodemailer's Gmail transport keeps its own
  // connection pool, so re-creating it per request would just add latency.
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.SUPPORT_EMAIL_USER, pass: env.SUPPORT_EMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

/**
 * Sends a "Need Help?" message straight from the app instead of routing the
 * user through their own mail client. `replyTo` is the user's own email, so
 * the team can just hit reply in their inbox rather than copy-pasting it out
 * of the message body.
 */
export async function sendSupportMessage(
  userEmail: string | null,
  input: ContactSupportInput,
): Promise<void> {
  const transport = getTransporter();
  const to = env.SUPPORT_EMAIL_TO || 'teamcollabcore@gmail.com';

  try {
    await transport.sendMail({
      from: `"BodyZeal Support Form" <${env.SUPPORT_EMAIL_USER}>`,
      to,
      replyTo: userEmail ?? undefined,
      subject: `[BodyZeal] ${input.subject}`,
      text: `From: ${input.name}${userEmail ? ` <${userEmail}>` : ''}\n\n${input.message}`,
    });
  } catch (error) {
    logger.error('Failed to send support email', { error: error instanceof Error ? error.message : String(error) });
    throw new AppError(502, 'EMAIL_SEND_FAILED', "Couldn't send your message — try again in a moment.");
  }
}
