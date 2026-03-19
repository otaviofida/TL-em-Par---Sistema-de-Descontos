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
