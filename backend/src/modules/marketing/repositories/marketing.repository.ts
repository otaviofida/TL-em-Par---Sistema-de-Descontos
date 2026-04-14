import { prisma } from '../../../config/prisma.js';

export class MarketingRepository {
  async create(data: { title: string; message: string; url?: string; scheduledAt: Date; createdBy: string }) {
    return prisma.marketingPush.create({ data });
  }

  async findAll(params: { skip: number; take: number; status?: string }) {
    const where = params.status ? { status: params.status } : {};

    const [data, total] = await Promise.all([
      prisma.marketingPush.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { scheduledAt: 'desc' },
        include: { admin: { select: { name: true } } },
      }),
      prisma.marketingPush.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.marketingPush.findUnique({
      where: { id },
      include: { admin: { select: { name: true } } },
    });
  }

  async update(id: string, data: { title?: string; message?: string; url?: string; scheduledAt?: Date }) {
    return prisma.marketingPush.update({ where: { id }, data });
  }

  async updateStatus(id: string, data: { status: string; sentAt?: Date; sentCount?: number; failCount?: number }) {
    return prisma.marketingPush.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.marketingPush.delete({ where: { id } });
  }

  async findScheduledDue() {
    return prisma.marketingPush.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: new Date() },
      },
    });
  }
}
