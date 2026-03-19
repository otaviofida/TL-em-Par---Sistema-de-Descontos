import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/auth.js';
import { uploadAvatar } from '../../../middlewares/upload.js';
import { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.get('/me', authenticate, controller.me);
router.put('/profile', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.put('/avatar', authenticate, uploadAvatar.single('avatar'), controller.uploadAvatar);

export { router as authRoutes };
