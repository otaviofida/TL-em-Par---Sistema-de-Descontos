import { Router } from 'express';
import { MarketingController } from '../controllers/marketing.controller.js';
import { authenticate, requireAdmin } from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import { createMarketingPushSchema, updateMarketingPushSchema } from '../schemas/marketing.schema.js';

const router = Router();
const controller = new MarketingController();

// Todas as rotas de marketing requerem admin
router.use(authenticate, requireAdmin);

router.get('/stats', controller.stats);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createMarketingPushSchema), controller.create);
router.put('/:id', validate(updateMarketingPushSchema), controller.update);
router.patch('/:id/cancel', controller.cancel);
router.delete('/:id', controller.delete);

export { router as marketingRoutes };
