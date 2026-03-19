import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  phone: z.string().optional(),
  cpf: z.string().transform(v => v.replace(/\D/g, '')).pipe(z.string().length(11, 'CPF deve ter 11 dígitos.')).optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').optional(),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
