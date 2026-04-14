import { prisma } from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';

export class ReviewRepository {
  async findByUserCompanyEdition(userId: string, companyId: string, editionId: string) {
    return prisma.review.findUnique({
      where: {
        userId_companyId_editionId: { userId, companyId, editionId },
      },
    });
  }

  async create(data: { userId: string; companyId: string; editionId: string; rating: number; comment?: string }) {
    return prisma.review.create({
      data,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async findByCompany(params: { companyId: string; skip: number; take: number }) {
    const where: Prisma.ReviewWhereInput = { companyId: params.companyId };

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total };
  }

  async getCompanyStats(companyId: string) {
    const result = await prisma.review.aggregate({
      where: { companyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      avgRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
      reviewCount: result._count.rating,
    };
  }

  async getCompanyStatsMany(companyIds: string[]) {
    const results = await prisma.review.groupBy({
      by: ['companyId'],
      where: { companyId: { in: companyIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const map = new Map<string, { avgRating: number; reviewCount: number }>();
    for (const r of results) {
      map.set(r.companyId, {
        avgRating: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : 0,
        reviewCount: r._count.rating,
      });
    }
    return map;
  }

  async findAll(params: {
    skip: number;
    take: number;
    companyId?: string;
    userId?: string;
  }) {
    const where: Prisma.ReviewWhereInput = {};
    if (params.companyId) where.companyId = params.companyId;
    if (params.userId) where.userId = params.userId;

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total };
  }

  async delete(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  async findById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  }
}
