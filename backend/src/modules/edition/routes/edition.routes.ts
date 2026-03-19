import { Router } from 'express';
import { EditionController } from '../controllers/edition.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate, requireAdmin } from '../../../middlewares/auth.js';
import { createEditionSchema, updateEditionSchema, linkCompaniesSchema } from '../schemas/edition.schema.js';

const router = Router();
const controller = new EditionController();

// Todas as rotas de edição são admin
router.use(authenticate, requireAdmin);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', validate(createEditionSchema), controller.create);
router.put('/:id', validate(updateEditionSchema), controller.update);
router.post('/:id/companies', validate(linkCompaniesSchema), controller.linkCompanies);
router.delete('/:id/companies/:companyId', controller.unlinkCompany);
router.get('/:id/companies', controller.getEditionCompanies);

export { router as editionRoutes };
