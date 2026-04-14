import { z } from 'zod';

export const createMarketingPushSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100),
  message: z.string().min(1, 'Mensagem obrigatória').max(500),
  url: z.string().url().optional().or(z.literal('')),
  scheduledAt: z.string().min(1, 'Data de agendamento obrigatória'),
});

export const updateMarketingPushSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  message: z.string().min(1).max(500).optional(),
  url: z.string().url().optional().or(z.literal('')),
  scheduledAt: z.string().optional(),
});
