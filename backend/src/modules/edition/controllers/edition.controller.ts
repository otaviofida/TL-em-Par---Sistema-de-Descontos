import { Request, Response, NextFunction } from 'express';
import { EditionService } from '../services/edition.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const editionService = new EditionService();

export class EditionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await editionService.create(req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await editionService.update(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const result = await editionService.findAll(pagination);
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await editionService.findById(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async linkCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await editionService.linkCompanies(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async unlinkCompany(req: Request, res: Response, next: NextFunction) {
    try {
      await editionService.unlinkCompany(req.params.id as string, req.params.companyId as string);
      return sendSuccess(res, { message: 'Empresa removida da edição.' });
    } catch (err) {
      next(err);
    }
  }

  async getEditionCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await editionService.getEditionCompanies(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
