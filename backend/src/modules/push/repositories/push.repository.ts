import { prisma } from '../../../config/prisma.js';

export class PushSubscriptionRepository {
  async upsert(data: { userId: string; endpoint: string; p256dh: string; auth: string }) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { userId: data.userId, p256dh: data.p256dh, auth: data.auth },
      create: data,
    });
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
    return prisma.pushSubscription.count();
  }
}
