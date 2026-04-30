import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/company.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const companyService = new CompanyService();

export class CompanyController {
  // --- Public ---
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const companies = await companyService.listPublic(category);
      return sendSuccess(res, companies);
    } catch (err) {
      next(err);
    }
  }

  // --- Admin ---
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.create(req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.update(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.updateStatus(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { search, status, editionId } = req.query as Record<string, string>;
      const result = await companyService.findAll(pagination, { search, status, editionId });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.findById(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getQrToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.getQrToken(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  // --- Subscriber ---
  async listForSubscriber(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { search, category } = req.query as Record<string, string>;
      const result = await companyService.listForSubscriber(req.userId!, pagination, { search, category });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getDetailForSubscriber(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.getDetailForSubscriber(req.params.id as string, req.userId!);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
