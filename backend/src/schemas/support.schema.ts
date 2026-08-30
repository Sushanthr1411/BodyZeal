import { z } from 'zod';

export const contactSupportSchema = z
  .object({
    // The frontend already knows the display name (profile/auth), sent along
    // rather than looked up again server-side — matches how the PDF report
    // (a different feature) sources its own display name the same way.
    name: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1, 'subject is required').max(150),
    message: z.string().trim().min(1, 'message is required').max(5000),
  })
  .strict();
export type ContactSupportInput = z.infer<typeof contactSupportSchema>;
