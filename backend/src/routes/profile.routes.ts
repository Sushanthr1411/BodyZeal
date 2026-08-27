import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile.schema';
import { getProfileController, putProfileController } from '../controllers/profile.controller';

export const profileRouter = Router();

profileRouter.get('/api/profile', authenticate, getProfileController);
profileRouter.put('/api/profile', authenticate, validate({ body: updateProfileSchema }), putProfileController);
