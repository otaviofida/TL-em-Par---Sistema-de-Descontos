import { Router } from 'express';
import { PushController } from '../controllers/push.controller.js';
import { authenticate } from '../../../middlewares/auth.js';

const router = Router();
const controller = new PushController();

// VAPID public key (público)
router.get('/vapid-key', controller.getVapidKey);

// Web Push (PWA/browser)
router.post('/subscribe', authenticate, controller.subscribe);
router.post('/unsubscribe', authenticate, controller.unsubscribe);

// Native push (Android FCM / iOS APNs via Capacitor)
router.post('/register-device', authenticate, controller.registerDevice);

export { router as pushRoutes };
