import { prisma } from '../../../config/prisma.js';
import { SubscriptionStatus } from '../../../generated/prisma/index.js';

export class SubscriptionRepository {
  async findByUserId(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
  }

  async findByStripeCustomerId(stripeCustomerId: string) {
    return prisma.subscription.findFirst({ where: { stripeCustomerId } });
  }

  async upsert(userId: string, data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }) {
    return prisma.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async updateByStripeSubscriptionId(stripeSubscriptionId: string, data: {
    status?: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }) {
    return prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    });
  }

  async createCancellationFeedback(data: {
    userId: string;
    reason: string;
    rating: number;
    improvement?: string;
    wouldReturn?: string;
  }) {
    return prisma.cancellationFeedback.create({ data });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: SubscriptionStatus;
    userId?: string;
  }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.userId) where.userId = params.userId;

    const [data, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.subscription.count({ where }),
    ]);

    return { data, total };
  }
}
