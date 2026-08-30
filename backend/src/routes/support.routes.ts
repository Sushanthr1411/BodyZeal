import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { contactSupportSchema } from '../schemas/support.schema';
import { contactSupportController } from '../controllers/support.controller';

export const supportRouter = Router();

// Backs the Dashboard sidebar's "Need Help?" modal — sends the message
// straight from the app instead of routing the user through mailto:.
supportRouter.post('/api/support/contact', authenticate, validate({ body: contactSupportSchema }), contactSupportController);
