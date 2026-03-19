import { Request, Response, NextFunction } from 'express';
import { BenefitService } from '../services/benefit.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const benefitService = new BenefitService();

export class BenefitController {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await benefitService.validateBenefit(req.userId!, req.body.qrToken);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as any);
      const { editionId } = req.query as any;
      const result = await benefitService.getUserHistory(req.userId!, pagination, editionId);
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
}
