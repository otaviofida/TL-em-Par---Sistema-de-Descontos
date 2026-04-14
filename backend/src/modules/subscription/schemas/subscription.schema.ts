import { z } from 'zod';

export const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID é obrigatório.'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cancelWithFeedbackSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório.'),
  rating: z.number().int().min(1).max(5),
  improvement: z.string().optional(),
  wouldReturn: z.enum(['sim', 'talvez', 'nao']).optional(),
});

export type CancelWithFeedbackInput = z.infer<typeof cancelWithFeedbackSchema>;
