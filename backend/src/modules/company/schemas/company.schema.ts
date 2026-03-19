import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Nome da empresa é obrigatório.'),
  description: z.string().optional(),
  category: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  coverUrl: z.string().optional().or(z.literal('')),
  benefitDescription: z.string().optional(),
  benefitRules: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const updateCompanyStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const listCompaniesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  editionId: z.string().uuid().optional(),
  category: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyStatusInput = z.infer<typeof updateCompanyStatusSchema>;
