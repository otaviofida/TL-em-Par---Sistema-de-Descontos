import { NotificationRepository } from '../repositories/notification.repository.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';

export class NotificationService {
  constructor(
    private notificationRepo = new NotificationRepository(),
  ) {}

  async list(userId: string, pagination: PaginationParams) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.notificationRepo.findByUser({ userId, skip, take });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationRepo.countUnread(userId);
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
  }

  // Helper estático para criar notificações de qualquer lugar
  static async notify(userId: string, params: { type: string; title: string; message: string; data?: Record<string, any> }) {
    const repo = new NotificationRepository();
    return repo.create({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data ? JSON.stringify(params.data) : undefined,
    });
  }
}
