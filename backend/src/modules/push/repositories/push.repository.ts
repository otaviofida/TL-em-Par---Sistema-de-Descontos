import { prisma } from '../../../config/prisma.js';

const MAX_SUBS_PER_USER = 3;

export class PushSubscriptionRepository {
  async upsert(data: { userId: string; endpoint: string; p256dh: string; auth: string }) {
    const result = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { userId: data.userId, p256dh: data.p256dh, auth: data.auth },
      create: data,
    });

    // Remove subscriptions antigas do mesmo usuário, mantendo apenas as MAX_SUBS_PER_USER mais recentes
    const all = await prisma.pushSubscription.findMany({
      where: { userId: data.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (all.length > MAX_SUBS_PER_USER) {
      const toDelete = all.slice(MAX_SUBS_PER_USER).map((s) => s.id);
      await prisma.pushSubscription.deleteMany({ where: { id: { in: toDelete } } });
    }

    return result;
  }

  async deleteByEndpoint(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async findByUserId(userId: string) {
    return prisma.pushSubscription.findMany({ where: { userId } });
  }

  async findAll() {
    return prisma.pushSubscription.findMany();
  }

  async deleteById(id: string) {
    return prisma.pushSubscription.delete({ where: { id } });
  }

  // Conta usuários únicos com pelo menos uma subscription ativa
  async countAll() {
    const result = await prisma.pushSubscription.groupBy({
      by: ['userId'],
    });
    return result.length;
  }
}
