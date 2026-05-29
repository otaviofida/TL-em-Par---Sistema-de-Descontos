import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/index.js';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '../generated/prisma/runtime/client.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) ?? [];
    const isEmail = fields.includes('email');
    const isCpf = fields.includes('cpf');
    const message = isEmail
      ? 'Este email já está cadastrado.'
      : isCpf
        ? 'Este CPF já está cadastrado.'
        : 'Dado duplicado.';
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message },
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Verifique os dados informados.',
        details: formattedErrors,
      },
    });
  }

  console.error('[ERROR]', err);

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente mais tarde.' },
  });
}
