import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';

const settingsService = new SettingsService();

export class SettingsController {
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getPublicSettings();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getAllSettings();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateSettings(req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
