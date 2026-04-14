import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const notificationService = new NotificationService();

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const result = await notificationService.list(req.userId!, pagination);
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.unreadCount(req.userId!);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id as string, req.userId!);
      return sendSuccess(res, null);
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.userId!);
      return sendSuccess(res, null);
    } catch (err) {
      next(err);
    }
  }
}
