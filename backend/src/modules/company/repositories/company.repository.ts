import { prisma } from '../../../config/prisma.js';
import { Prisma, CompanyStatus } from '../../../generated/prisma/index.js';
import { isScheduleAvailableNow } from '../../../utils/timezone.js';

export class CompanyRepository {
  async findById(id: string) {
    return prisma.company.findUnique({ where: { id, deletedAt: null } });
  }

  async findByQrToken(qrToken: string) {
    return prisma.company.findUnique({ where: { qrToken, deletedAt: null } });
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
    const where: Prisma.CompanyWhereInput = { deletedAt: null };

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
    availableNow?: boolean;
  }) {
    const where: Prisma.CompanyWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
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
          schedules: true,
        },
      }),
      prisma.company.count({ where }),
    ]);

    let data = companies.map(({ benefitRedemptions, schedules, qrToken: _, ...company }) => ({
      ...company,
      alreadyUsed: benefitRedemptions.length > 0,
      isAvailableNow: isScheduleAvailableNow(schedules),
    }));

    let total_ = total;
    if (params.availableNow) {
      data = data.filter(c => c.isAvailableNow);
      total_ = data.length;
    }

    return { data, total: total_ };
  }

  async findByIdWithUsage(companyId: string, userId: string, editionId: string) {
    return prisma.company.findUnique({
      where: { id: companyId, deletedAt: null },
      include: {
        benefitRedemptions: {
          where: { userId, editionId },
          select: { id: true, redeemedAt: true },
        },
      },
    });
  }

  async findSchedules(companyId: string) {
    return prisma.companySchedule.findMany({
      where: { companyId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async upsertSchedules(companyId: string, days: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[]) {
    return prisma.$transaction(
      days.map(d =>
        prisma.companySchedule.upsert({
          where: { companyId_dayOfWeek: { companyId, dayOfWeek: d.dayOfWeek } },
          create: { companyId, ...d },
          update: { isOpen: d.isOpen, openTime: d.openTime, closeTime: d.closeTime },
        }),
      ),
    );
  }

  async softDelete(id: string) {
    return prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    return prisma.company.update({ where: { id }, data: { deletedAt: null } });
  }
}
