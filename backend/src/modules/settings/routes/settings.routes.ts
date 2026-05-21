import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';

const router = Router();
const controller = new SettingsController();

// Public — returns only safe, non-sensitive settings
router.get('/', controller.getPublic);

export { router as settingsRoutes };
