import { Router } from 'express';
import { BenefitController } from '../controllers/benefit.controller.js';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/auth.js';
import { validateBenefitSchema } from '../schemas/benefit.schema.js';

const router = Router();
const controller = new BenefitController();

router.use(authenticate);

router.post('/validate', validate(validateBenefitSchema), controller.validate);
router.get('/history', controller.history);

export { router as benefitRoutes };
