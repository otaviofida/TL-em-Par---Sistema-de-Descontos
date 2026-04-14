import { prisma } from '../../../config/prisma.js';

export class NotificationRepository {
  async create(data: { userId: string; type: string; title: string; message: string; data?: string }) {
    return prisma.notification.create({ data });
  }

  async findByUser(params: { userId: string; skip: number; take: number }) {
    const where = { userId: params.userId };

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, total };
  }

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }
}
