import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/auth.js';
import { uploadAvatar, cloudinaryUpload } from '../../../middlewares/upload.js';
import { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.get('/verify-email/:token', controller.verifyEmail);
router.post('/resend-verification', authenticate, controller.resendVerification);
router.get('/me', authenticate, controller.me);
router.put('/profile', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.put('/avatar', authenticate, uploadAvatar.single('avatar'), cloudinaryUpload('avatars', 'avatars'), controller.uploadAvatar);

export { router as authRoutes };
