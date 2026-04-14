import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const reviewService = new ReviewService();

export class ReviewController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.create(req.userId!, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async listByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const result = await reviewService.listByCompany(req.params.companyId as string, pagination);
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getCompanyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.getCompanyStats(req.params.companyId as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  // Admin
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { companyId, userId } = req.query as Record<string, string>;
      const result = await reviewService.listAll(pagination, { companyId, userId });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await reviewService.delete(req.params.id as string);
      return sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  }
}
