import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate, requireAdmin, requireActiveSubscription } from '../../../middlewares/auth.js';
import { createReviewSchema } from '../schemas/review.schema.js';

const router = Router();
const controller = new ReviewController();

// --- Subscriber routes ---
router.post('/', authenticate, requireActiveSubscription, validate(createReviewSchema), controller.create);
router.get('/company/:companyId', authenticate, controller.listByCompany);
router.get('/company/:companyId/stats', controller.getCompanyStats);

// --- Admin routes ---
router.get('/admin', authenticate, requireAdmin, controller.listAll);
router.delete('/admin/:id', authenticate, requireAdmin, controller.delete);

export { router as reviewRoutes };
