import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate, requireAdmin } from '../../../middlewares/auth.js';
import { uploadLogo, uploadCover } from '../../../middlewares/upload.js';
import { createCompanySchema, updateCompanySchema, updateCompanyStatusSchema } from '../../company/schemas/company.schema.js';

const router = Router();
const controller = new AdminController();

// Todas as rotas admin requerem autenticação + role ADMIN
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', controller.dashboard);

// Metrics
router.get('/metrics', controller.metrics);

// Users
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.getUser);
router.delete('/users/:id', controller.deleteUser);

// Subscriptions
router.get('/subscriptions', controller.listSubscriptions);

// Redemptions
router.get('/redemptions', controller.listRedemptions);

// Companies (Admin CRUD)
router.get('/companies', controller.listCompanies);
router.get('/companies/:id', controller.getCompany);
router.post('/companies', validate(createCompanySchema), controller.createCompany);
router.put('/companies/:id', validate(updateCompanySchema), controller.updateCompany);
router.patch('/companies/:id/status', validate(updateCompanyStatusSchema), controller.updateCompanyStatus);
router.get('/companies/:id/qr-token', controller.getCompanyQrToken);

// Uploads
router.post('/upload/logo', uploadLogo.single('logo'), controller.uploadLogo);
router.post('/upload/cover', uploadCover.single('cover'), controller.uploadCover);

export { router as adminRoutes };
