import { MarketingRepository } from '../repositories/marketing.repository.js';
import { PushService } from '../../push/services/push.service.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';

export class MarketingService {
  constructor(
    private marketingRepo = new MarketingRepository(),
    private pushService = new PushService(),
  ) {}

  async create(data: { title: string; message: string; url?: string; scheduledAt: string; createdBy: string }) {
    return this.marketingRepo.create({
      ...data,
      scheduledAt: new Date(data.scheduledAt),
    });
  }

  async list(pagination: PaginationParams, status?: string) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.marketingRepo.findAll({ skip, take, status });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getById(id: string) {
    const push = await this.marketingRepo.findById(id);
    if (!push) throw new NotFoundError('Push não encontrado');
    return push;
  }

  async update(id: string, data: { title?: string; message?: string; url?: string; scheduledAt?: string }) {
    const push = await this.marketingRepo.findById(id);
    if (!push) throw new NotFoundError('Push não encontrado');
    if (push.status !== 'SCHEDULED') throw new NotFoundError('Só é possível editar pushes agendados');

    return this.marketingRepo.update(id, {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    });
  }

  async cancel(id: string) {
    const push = await this.marketingRepo.findById(id);
    if (!push) throw new NotFoundError('Push não encontrado');
    if (push.status !== 'SCHEDULED') throw new NotFoundError('Só é possível cancelar pushes agendados');

    return this.marketingRepo.updateStatus(id, { status: 'CANCELLED' });
  }

  async delete(id: string) {
    const push = await this.marketingRepo.findById(id);
    if (!push) throw new NotFoundError('Push não encontrado');
    return this.marketingRepo.delete(id);
  }

  async getStats() {
    const subscriberCount = await this.pushService.getSubscriberCount();
    return { subscriberCount };
  }

  /** Chamado pelo cron — verifica pushes agendados e envia */
  async processScheduled() {
    const duePushes = await this.marketingRepo.findScheduledDue();

    for (const push of duePushes) {
      try {
        await this.marketingRepo.updateStatus(push.id, { status: 'SENDING' });

        const result = await this.pushService.sendToAll({
          title: push.title,
          message: push.message,
          url: push.url || undefined,
        });

        await this.marketingRepo.updateStatus(push.id, {
          status: 'SENT',
          sentAt: new Date(),
          sentCount: result.sent,
          failCount: result.failed,
        });

        console.log(`[MARKETING] Push "${push.title}" enviado: ${result.sent} ok, ${result.failed} falhas`);
      } catch (err) {
        console.error(`[MARKETING] Erro ao enviar push "${push.title}":`, err);
        await this.marketingRepo.updateStatus(push.id, { status: 'FAILED' });
      }
    }
  }
}
