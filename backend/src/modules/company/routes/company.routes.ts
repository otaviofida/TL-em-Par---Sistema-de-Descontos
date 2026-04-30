import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate, requireAdmin, requireActiveSubscription } from '../../../middlewares/auth.js';
import { createCompanySchema, updateCompanySchema, updateCompanyStatusSchema, listCompaniesQuerySchema } from '../schemas/company.schema.js';

const router = Router();
const controller = new CompanyController();

// --- Public routes ---
router.get('/public', controller.listPublic);

// --- Subscriber routes (RN-ASS-01: requer assinatura ativa) ---
router.get('/', authenticate, requireActiveSubscription, controller.listForSubscriber);
router.get('/:id', authenticate, requireActiveSubscription, controller.getDetailForSubscriber);

export { router as companyRoutes };
