import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { CompanyService } from '../../company/services/company.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { getPaginationParams } from '../../../shared/helpers/pagination.js';

const adminService = new AdminService();
const companyService = new CompanyService();

export class AdminController {
  // --- Dashboard ---
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getDashboard();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  // --- Metrics ---
  async metrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'startDate e endDate são obrigatórios.' } });
      }
      const result = await adminService.getMetrics(startDate, endDate);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  // --- Users ---
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { search, subscriptionStatus } = req.query as Record<string, string>;
      const result = await adminService.getUsers(pagination, { search, subscriptionStatus });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getUserById(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteUser(req.params.id as string);
      return sendSuccess(res, { message: 'Usuário removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  // --- Subscriptions ---
  async listSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { status, userId } = req.query as Record<string, string>;
      const result = await adminService.getSubscriptions(pagination, { status, userId });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  // --- Redemptions ---
  async listRedemptions(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { userId, companyId, editionId, startDate, endDate } = req.query as Record<string, string>;
      const result = await adminService.getRedemptions(pagination, { userId, companyId, editionId, startDate, endDate });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  // --- Companies (Admin CRUD) ---
  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.create(req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.update(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateCompanyStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.updateStatus(req.params.id as string, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query as Record<string, string>);
      const { search, status, editionId } = req.query as Record<string, string>;
      const result = await companyService.findAll(pagination, { search, status, editionId });
      return sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.findById(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getCompanyQrToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.getQrToken(req.params.id as string);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Nenhum arquivo enviado.' } });
      }
      const url = `/uploads/logos/${req.file.filename}`;
      return sendSuccess(res, { url }, 201);
    } catch (err) {
      next(err);
    }
  }

  async uploadCover(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Nenhum arquivo enviado.' } });
      }
      const url = `/uploads/covers/${req.file.filename}`;
      return sendSuccess(res, { url }, 201);
    } catch (err) {
      next(err);
    }
  }
}
