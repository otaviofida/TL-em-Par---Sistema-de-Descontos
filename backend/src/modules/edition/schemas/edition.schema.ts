import { z } from 'zod';

export const createEditionSchema = z.object({
  name: z.string().min(2, 'Nome da edição é obrigatório.'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de início inválida.'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de fim inválida.'),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'Data de início deve ser anterior à data de fim.',
  path: ['endDate'],
});

export const updateEditionSchema = z.object({
  name: z.string().min(2).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de início inválida.').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de fim inválida.').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'FINISHED']).optional(),
});

export const linkCompaniesSchema = z.object({
  companyIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos 1 empresa.'),
});

export type CreateEditionInput = z.infer<typeof createEditionSchema>;
export type UpdateEditionInput = z.infer<typeof updateEditionSchema>;
export type LinkCompaniesInput = z.infer<typeof linkCompaniesSchema>;
