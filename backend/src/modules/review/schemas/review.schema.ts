import { z } from 'zod';

export const createReviewSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido.'),
  rating: z.number().int().min(1, 'Nota mínima é 1.').max(5, 'Nota máxima é 5.'),
  comment: z.string().max(500, 'Comentário deve ter no máximo 500 caracteres.').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
