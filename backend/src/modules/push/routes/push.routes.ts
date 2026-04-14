import { Router } from 'express';
import { PushController } from '../controllers/push.controller.js';
import { authenticate } from '../../../middlewares/auth.js';

const router = Router();
const controller = new PushController();

// VAPID public key (público — para o frontend se inscrever)
router.get('/vapid-key', controller.getVapidKey);

// Inscrever/desinscrever (autenticado)
router.post('/subscribe', authenticate, controller.subscribe);
router.post('/unsubscribe', authenticate, controller.unsubscribe);

export { router as pushRoutes };
