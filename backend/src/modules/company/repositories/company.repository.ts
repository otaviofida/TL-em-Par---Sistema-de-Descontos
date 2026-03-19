import { prisma } from '../../../config/prisma.js';
import { Prisma, CompanyStatus } from '../../../generated/prisma/index.js';

export class CompanyRepository {
  async findById(id: string) {
    return prisma.company.findUnique({ where: { id } });
  }

  async findByQrToken(qrToken: string) {
    return prisma.company.findUnique({ where: { qrToken } });
  }

  async create(data: Prisma.CompanyCreateInput) {
    return prisma.company.create({ data });
  }

  async update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({ where: { id }, data });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    status?: CompanyStatus;
    editionId?: string;
  }) {
    const where: Prisma.CompanyWhereInput = {};

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.editionId) {
      where.editions = { some: { editionId: params.editionId } };
    }

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
      }),
      prisma.company.count({ where }),
    ]);

    return { data, total };
  }

  async findActiveInEdition(params: {
    editionId: string;
    skip: number;
    take: number;
    search?: string;
    category?: string;
    userId: string;
  }) {
    const where: Prisma.CompanyWhereInput = {
      status: 'ACTIVE',
      editions: { some: { editionId: params.editionId } },
    };

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.category) {
      where.category = params.category;
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
        include: {
          benefitRedemptions: {
            where: { userId: params.userId, editionId: params.editionId },
            select: { id: true },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    const data = companies.map(({ benefitRedemptions, qrToken: _, ...company }) => ({
      ...company,
      alreadyUsed: benefitRedemptions.length > 0,
    }));

    return { data, total };
  }

  async findByIdWithUsage(companyId: string, userId: string, editionId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: {
        benefitRedemptions: {
          where: { userId, editionId },
          select: { id: true, redeemedAt: true },
        },
      },
    });
  }
}
