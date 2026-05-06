import { z } from 'zod';

export const adminRedemptionsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  userId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  editionId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const adminUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  subscriptionStatus: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE']).optional(),
});

export const adminSubscriptionsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE']).optional(),
  userId: z.string().uuid().optional(),
});

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const upsertCompanyScheduleSchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    isOpen: z.boolean(),
    openTime: z.string().regex(timeRegex, 'Formato HH:mm').default('00:00'),
    closeTime: z.string().regex(timeRegex, 'Formato HH:mm').default('00:00'),
  }),
).length(7, 'Envie os 7 dias da semana');

export type UpsertCompanyScheduleInput = z.infer<typeof upsertCompanyScheduleSchema>;
