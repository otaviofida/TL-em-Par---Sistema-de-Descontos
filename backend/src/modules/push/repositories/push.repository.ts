import { prisma } from '../../../config/prisma.js';

const MAX_SUBS_PER_USER = 3;

export class PushSubscriptionRepository {
  async upsertWeb(data: { userId: string; endpoint: string; p256dh: string; auth: string }) {
    const result = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { userId: data.userId, p256dh: data.p256dh, auth: data.auth },
      create: { ...data, platform: 'web' },
    });

    await this.trimOldSubs(data.userId);
    return result;
  }

  async upsertDevice(data: { userId: string; fcmToken: string; platform: 'android' | 'ios' }) {
    const result = await prisma.pushSubscription.upsert({
      where: { fcmToken: data.fcmToken },
      update: { userId: data.userId, platform: data.platform },
      create: data,
    });

    await this.trimOldSubs(data.userId);
    return result;
  }

  private async trimOldSubs(userId: string) {
    const all = await prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (all.length > MAX_SUBS_PER_USER) {
      const toDelete = all.slice(MAX_SUBS_PER_USER).map((s) => s.id);
      await prisma.pushSubscription.deleteMany({ where: { id: { in: toDelete } } });
    }
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

  async countAll() {
    const result = await prisma.pushSubscription.groupBy({ by: ['userId'] });
    return result.length;
  }
}
