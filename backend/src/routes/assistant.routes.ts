import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { chatSchema } from '../schemas/assistant.schema';
import { chatController } from '../controllers/assistant.controller';

export const assistantRouter = Router();

// Genuine free-text questions only — the frontend's 4 preset buttons stay
// rule-based/local and never hit this route (hybrid design, Phase 3F).
assistantRouter.post('/api/assistant/chat', authenticate, validate({ body: chatSchema }), chatController);
