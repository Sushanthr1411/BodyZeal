import { z } from 'zod';

const historyTurnSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    text: z.string().max(2000, 'text must be at most 2000 characters'),
  })
  .strict();

export const chatSchema = z
  .object({
    message: z.string().trim().min(1, 'message is required').max(2000, 'message must be at most 2000 characters'),
    history: z.array(historyTurnSchema).max(6, 'history can include at most 6 turns').optional(),
  })
  .strict();

export type ChatInput = z.infer<typeof chatSchema>;
