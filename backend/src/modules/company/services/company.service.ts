import { CompanyRepository } from '../repositories/company.repository.js';
import { CreateCompanyInput, UpdateCompanyInput, UpdateCompanyStatusInput } from '../schemas/company.schema.js';
import { NotFoundError, AppError } from '../../../shared/errors/index.js';
import { EditionRepository } from '../../edition/repositories/edition.repository.js';
import { ReviewRepository } from '../../review/repositories/review.repository.js';
import { PaginationParams, PaginatedResult } from '../../../shared/helpers/pagination.js';
import { getPrismaSkipTake } from '../../../shared/helpers/pagination.js';
import { PushService } from '../../push/services/push.service.js';
import { NotificationService } from '../../notification/services/notification.service.js';
import { prisma } from '../../../config/prisma.js';
import { env } from '../../../config/env.js';

export class CompanyService {
  constructor(
    private companyRepo = new CompanyRepository(),
    private editionRepo = new EditionRepository(),
    private reviewRepo = new ReviewRepository(),
    private pushService = new PushService(),
  ) {}

  async listPublic(category?: string) {
    return prisma.company.findMany({
      where: { status: 'ACTIVE', deletedAt: null, ...(category ? { category } : {}) },
      select: { id: true, name: true, logoUrl: true, coverUrl: true, benefitDescription: true, category: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: CreateCompanyInput) {
    const company = await this.companyRepo.create({
      name: data.name,
      description: data.description,
      category: data.category,
      address: data.address,
      city: data.city,
      phone: data.phone,
      instagram: data.instagram,
      logoUrl: data.logoUrl || undefined,
      coverUrl: data.coverUrl || undefined,
      benefitDescription: data.benefitDescription,
      benefitRules: data.benefitRules,
    });

    // Auto-vincular à edição ativa se existir
    const activeEdition = await this.editionRepo.findActive();
    if (activeEdition) {
      await this.editionRepo.linkCompanies(activeEdition.id, [company.id]);
    }

    // Notificação in-app + push para todos os assinantes ativos
    const companyUrl = `${env.FRONTEND_URL}/empresas/${company.id}`;
    prisma.subscription.findMany({ where: { status: 'ACTIVE' }, select: { userId: true } })
      .then(subs => Promise.all(subs.map(s =>
        NotificationService.notify(s.userId, {
          type: 'NEW_COMPANY',
          title: '🍽️ Novo restaurante no clube!',
          message: `${company.name} acabou de entrar no TL em Par. Confira o benefício!`,
          data: { companyId: company.id, companyName: company.name },
        }),
      )))
      .catch(err => console.error('[NOTIFICATION] Erro ao notificar novo restaurante:', err));

    this.pushService.sendToAll({
      title: '🍽️ Novo restaurante no clube!',
      message: `${company.name} acabou de entrar no TL em Par. Confira o benefício!`,
      url: companyUrl,
    }).catch(err => console.error('[PUSH] Erro ao notificar novo restaurante:', err));

    return company;
  }

  async update(id: string, data: UpdateCompanyInput) {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada.');
    }

    return this.companyRepo.update(id, {
      ...data,
      logoUrl: data.logoUrl || undefined,
      coverUrl: data.coverUrl || undefined,
    });
  }

  async updateStatus(id: string, data: UpdateCompanyStatusInput) {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada.');
    }

    return this.companyRepo.update(id, { status: data.status });
  }

  async findAll(pagination: PaginationParams, filters: { search?: string; status?: string; editionId?: string }) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.companyRepo.findAll({
      skip,
      take,
      search: filters.search,
      status: filters.status as any,
      editionId: filters.editionId,
    });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findById(id: string) {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada.');
    }
    return company;
  }

  async getQrToken(id: string) {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada.');
    }
    return { qrToken: company.qrToken, companyName: company.name };
  }

  async listForSubscriber(userId: string, pagination: PaginationParams, filters: { search?: string; category?: string }) {
    const activeEdition = await this.editionRepo.findActive();
    if (!activeEdition) {
      throw new AppError('Nenhuma edição ativa no momento.', 404, 'NO_ACTIVE_EDITION');
    }

    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.companyRepo.findActiveInEdition({
      editionId: activeEdition.id,
      skip,
      take,
      search: filters.search,
      category: filters.category,
      userId,
    });

    // Enriquecer com avgRating/reviewCount
    const companyIds = data.map((c: any) => c.id);
    const statsMap = await this.reviewRepo.getCompanyStatsMany(companyIds);
    const enriched = data.map((c: any) => {
      const stats = statsMap.get(c.id) || { avgRating: 0, reviewCount: 0 };
      return { ...c, avgRating: stats.avgRating, reviewCount: stats.reviewCount };
    });

    return {
      data: enriched,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async softDelete(id: string) {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada.');
    }
    return this.companyRepo.softDelete(id);
  }

  async getDetailForSubscriber(companyId: string, userId: string) {
    const activeEdition = await this.editionRepo.findActive();
    if (!activeEdition) {
      throw new AppError('Nenhuma edição ativa no momento.', 404, 'NO_ACTIVE_EDITION');
    }

    const company = await this.companyRepo.findByIdWithUsage(companyId, userId, activeEdition.id);
    if (!company || company.status !== 'ACTIVE') {
      throw new NotFoundError('Empresa não encontrada.');
    }

    const { benefitRedemptions, qrToken: _, ...companyData } = company;
    const reviewStats = await this.reviewRepo.getCompanyStats(companyId);
    return {
      ...companyData,
      alreadyUsed: benefitRedemptions.length > 0,
      usedAt: benefitRedemptions.length > 0 ? benefitRedemptions[0].redeemedAt : null,
      avgRating: reviewStats.avgRating,
      reviewCount: reviewStats.reviewCount,
    };
  }
}
