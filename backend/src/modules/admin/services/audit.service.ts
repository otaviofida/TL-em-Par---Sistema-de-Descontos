import { prisma } from '../../../config/prisma.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';

interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export class AuditService {
  async log(input: AuditLogInput) {
    return prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details,
        ipAddress: input.ipAddress,
      },
    });
  }

  async findAll(
    pagination: PaginationParams,
    filters: { entity?: string; action?: string; userId?: string },
  ) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const where: any = {};

    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}
