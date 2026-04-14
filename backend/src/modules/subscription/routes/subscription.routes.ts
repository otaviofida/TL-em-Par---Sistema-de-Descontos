import { Router, raw } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/auth.js';
import { checkoutSchema, cancelWithFeedbackSchema } from '../schemas/subscription.schema.js';

const router = Router();
const controller = new SubscriptionController();

// Webhook precisa receber raw body — configurado no app.ts
router.post('/webhook', raw({ type: 'application/json' }), controller.webhook);

// Rotas autenticadas
router.post('/checkout', authenticate, validate(checkoutSchema), controller.checkout);
router.get('/status', authenticate, controller.status);
router.post('/cancel', authenticate, validate(cancelWithFeedbackSchema), controller.cancel);
router.post('/verify-session', authenticate, controller.verifySession);
router.post('/portal', authenticate, controller.portal);

export { router as subscriptionRoutes };
