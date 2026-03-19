import { z } from 'zod';

export const validateBenefitSchema = z.object({
  qrToken: z.string().uuid('QR Token inválido.'),
});

export const benefitHistoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  editionId: z.string().uuid().optional(),
});

export type ValidateBenefitInput = z.infer<typeof validateBenefitSchema>;
