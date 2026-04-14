import { prisma } from '../../../config/prisma.js';

export class AdminRepository {
  async getDashboardStats() {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalUsers,
      activeSubscriptions,
      totalCompanies,
      activeCompanies,
      totalRedemptions,
      redemptionsThisMonth,
      currentEdition,
      topCompanies,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER', deletedAt: null } }),
      prisma.subscription.count({ where: { status: 'ACTIVE', user: { deletedAt: null } } }),
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.benefitRedemption.count(),
      prisma.benefitRedemption.count({
        where: { redeemedAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.edition.findFirst({
        where: { status: 'ACTIVE', startDate: { lte: now }, endDate: { gte: now } },
        include: { _count: { select: { benefitRedemptions: true } } },
      }),
      prisma.company.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          _count: { select: { benefitRedemptions: true } },
        },
        orderBy: { benefitRedemptions: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      totalCompanies,
      activeCompanies,
      totalRedemptions,
      redemptionsThisMonth,
      currentEdition: currentEdition
        ? {
            id: currentEdition.id,
            name: currentEdition.name,
            redemptionCount: currentEdition._count.benefitRedemptions,
          }
        : null,
      topCompanies: topCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        redemptionCount: c._count.benefitRedemptions,
      })),
    };
  }

  async findUsers(params: {
    skip: number;
    take: number;
    search?: string;
    subscriptionStatus?: string;
  }) {
    const where: any = { role: 'USER', deletedAt: null };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.subscriptionStatus) {
      where.subscription = { status: params.subscriptionStatus };
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          createdAt: true,
          subscription: { select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        subscription: true,
        benefitRedemptions: {
          orderBy: { redeemedAt: 'desc' },
          include: {
            company: { select: { id: true, name: true } },
            edition: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async deleteUser(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restoreUser(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: null } });
  }

  async getMetrics(startDate: Date, endDate: Date) {
    const [
      newSubscribers,
      canceledSubscribers,
      totalActiveSubscriptions,
      redemptionsInPeriod,
      usersWithBirthDate,
      genderDistribution,
      dailyNewSubscribers,
      dailyRedemptions,
    ] = await Promise.all([
      // Novos assinantes no período
      prisma.subscription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'INCOMPLETE' },
        },
      }),
      // Cancelamentos no período
      prisma.subscription.count({
        where: {
          status: 'CANCELED',
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
      // Total de assinaturas ativas
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      // Validações no período
      prisma.benefitRedemption.count({
        where: {
          redeemedAt: { gte: startDate, lte: endDate },
        },
      }),
      // Usuários com data de nascimento (para idade média)
      prisma.user.findMany({
        where: {
          role: 'USER',
          deletedAt: null,
          birthDate: { not: null },
          subscription: { status: 'ACTIVE' },
        },
        select: { birthDate: true },
      }),
      // Distribuição por gênero
      prisma.user.groupBy({
        by: ['gender'],
        where: {
          role: 'USER',
          deletedAt: null,
          subscription: { status: 'ACTIVE' },
        },
        _count: true,
      }),
      // Novos assinantes por dia no período
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*)::bigint as count
        FROM subscriptions
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          AND status != 'INCOMPLETE'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Validações por dia no período
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(redeemed_at) as date, COUNT(*)::bigint as count
        FROM benefit_redemptions
        WHERE redeemed_at >= ${startDate} AND redeemed_at <= ${endDate}
        GROUP BY DATE(redeemed_at)
        ORDER BY date ASC
      `,
    ]);

    // Calcular idade média
    const now = new Date();
    const ages = usersWithBirthDate
      .filter((u) => u.birthDate)
      .map((u) => {
        const birth = u.birthDate!;
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        return age;
      });
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

    // Formatar gênero
    const genderData = genderDistribution.map((g) => ({
      gender: g.gender || 'não informado',
      count: g._count,
    }));

    // Valor estimado (assinaturas ativas * preço mensal)
    // O preço é fixo, mas podemos calcular baseado no count
    const MONTHLY_PRICE = 29.90;
    const totalRevenue = totalActiveSubscriptions * MONTHLY_PRICE;

    return {
      newSubscribers,
      canceledSubscribers,
      totalActiveSubscriptions,
      totalRevenue,
      redemptionsInPeriod,
      averageAge,
      genderDistribution: genderData,
      dailyNewSubscribers: dailyNewSubscribers.map((d) => ({
        date: typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0],
        count: Number(d.count),
      })),
      dailyRedemptions: dailyRedemptions.map((d) => ({
        date: typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0],
        count: Number(d.count),
      })),
    };
  }
}
