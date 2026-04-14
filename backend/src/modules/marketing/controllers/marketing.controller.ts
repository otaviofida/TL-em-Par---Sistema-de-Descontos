import { Request, Response, NextFunction } from 'express';
import { MarketingService } from '../services/marketing.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const marketingService = new MarketingService();

export class MarketingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const result = await marketingService.create({ ...req.body, createdBy: userId });
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const status = req.query.status as string | undefined;
      const result = await marketingService.list(pagination, status);
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketingService.getById(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketingService.update(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketingService.cancel(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await marketingService.delete(req.params.id as string);
      return sendSuccess(res, { message: 'Push removido' });
    } catch (err) {
      next(err);
    }
  }

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketingService.getStats();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
