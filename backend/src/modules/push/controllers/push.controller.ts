import { Request, Response, NextFunction } from 'express';
import { PushService } from '../services/push.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';

const pushService = new PushService();

export class PushController {
  async getVapidKey(_req: Request, res: Response, next: NextFunction) {
    try {
      const key = pushService.getVapidPublicKey();
      return sendSuccess(res, { publicKey: key });
    } catch (err) {
      next(err);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { subscription } = req.body;
      await pushService.subscribe(userId, subscription);
      return sendSuccess(res, { message: 'Inscrito com sucesso' }, 201);
    } catch (err) {
      next(err);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { endpoint } = req.body;
      await pushService.unsubscribe(endpoint);
      return sendSuccess(res, { message: 'Desinscrito com sucesso' });
    } catch (err) {
      next(err);
    }
  }
}
