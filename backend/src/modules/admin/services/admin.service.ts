import { AdminRepository } from '../repositories/admin.repository.js';
import { BenefitRepository } from '../../benefit/repositories/benefit.repository.js';
import { SubscriptionRepository } from '../../subscription/repositories/subscription.repository.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';
import { stripe } from '../../../config/stripe.js';

export class AdminService {
  constructor(
    private adminRepo = new AdminRepository(),
    private benefitRepo = new BenefitRepository(),
    private subscriptionRepo = new SubscriptionRepository(),
  ) {}

  async getDashboard() {
    return this.adminRepo.getDashboardStats();
  }

  async getUsers(pagination: PaginationParams, filters: { search?: string; subscriptionStatus?: string }) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.adminRepo.findUsers({
      skip,
      take,
      search: filters.search,
      subscriptionStatus: filters.subscriptionStatus,
    });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getUserById(id: string) {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    // Buscar histórico de pagamentos no Stripe
    let paymentHistory: any[] = [];
    if (user.subscription?.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.subscription.stripeCustomerId,
          limit: 50,
        });
        paymentHistory = invoices.data.map((inv) => ({
          id: inv.id,
          amount: inv.amount_paid,
          currency: inv.currency,
          status: inv.status,
          paidAt: inv.status_transitions?.paid_at
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
            : null,
          invoiceUrl: inv.hosted_invoice_url,
        }));
      } catch {
        // Stripe indisponível — retorna sem histórico
      }
    }

    return { ...user, paymentHistory };
  }

  async deleteUser(id: string) {
    const user = await this.adminRepo.findUserById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    if (user.role === 'ADMIN') {
      throw new Error('Não é possível remover um administrador.');
    }

    // Cancelar assinatura no Stripe se existir
    if (user.subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch {
        // Ignora erro se já cancelada no Stripe
      }
    }

    await this.adminRepo.deleteUser(id);
  }

  async getSubscriptions(pagination: PaginationParams, filters: { status?: string; userId?: string }) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.subscriptionRepo.findAll({
      skip,
      take,
      status: filters.status as any,
      userId: filters.userId,
    });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getRedemptions(pagination: PaginationParams, filters: {
    userId?: string;
    companyId?: string;
    editionId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.benefitRepo.findAllRedemptions({
      skip,
      take,
      userId: filters.userId,
      companyId: filters.companyId,
      editionId: filters.editionId,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getMetrics(startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return this.adminRepo.getMetrics(start, end);
  }
}
