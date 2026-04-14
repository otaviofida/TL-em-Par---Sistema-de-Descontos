import { prisma } from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';

export class BenefitRepository {
  async findRedemption(userId: string, companyId: string, editionId: string) {
    return prisma.benefitRedemption.findUnique({
      where: {
        userId_companyId_editionId: { userId, companyId, editionId },
      },
    });
  }

  async createRedemption(data: { userId: string; companyId: string; editionId: string }) {
    return prisma.benefitRedemption.create({
      data,
      include: {
        company: { select: { id: true, name: true, benefitDescription: true } },
        edition: { select: { id: true, name: true } },
      },
    });
  }

  async findUserHistory(params: {
    userId: string;
    skip: number;
    take: number;
    editionId?: string;
    search?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.BenefitRedemptionWhereInput = {
      userId: params.userId,
    };

    if (params.editionId) {
      where.editionId = params.editionId;
    }
    if (params.search) {
      where.company = { name: { contains: params.search, mode: 'insensitive' } };
    }
    if (params.category) {
      where.company = { ...where.company as any, category: params.category };
    }
    if (params.startDate || params.endDate) {
      where.redeemedAt = {};
      if (params.startDate) where.redeemedAt.gte = params.startDate;
      if (params.endDate) where.redeemedAt.lte = params.endDate;
    }

    const [data, total] = await Promise.all([
      prisma.benefitRedemption.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { redeemedAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logoUrl: true, benefitDescription: true } },
          edition: { select: { id: true, name: true } },
        },
      }),
      prisma.benefitRedemption.count({ where }),
    ]);

    return { data, total };
  }

  async findAllRedemptions(params: {
    skip: number;
    take: number;
    userId?: string;
    companyId?: string;
    editionId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    const where: Prisma.BenefitRedemptionWhereInput = {};

    if (params.userId) where.userId = params.userId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.editionId) where.editionId = params.editionId;
    if (params.search) {
      where.company = { name: { contains: params.search, mode: 'insensitive' } };
    }
    if (params.startDate || params.endDate) {
      where.redeemedAt = {};
      if (params.startDate) where.redeemedAt.gte = params.startDate;
      if (params.endDate) where.redeemedAt.lte = params.endDate;
    }

    const [data, total] = await Promise.all([
      prisma.benefitRedemption.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { redeemedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          company: { select: { id: true, name: true } },
          edition: { select: { id: true, name: true } },
        },
      }),
      prisma.benefitRedemption.count({ where }),
    ]);

    return { data, total };
  }
}
