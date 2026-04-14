import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/index.js';
import { JwtPayload } from '../shared/types/auth.js';
import { Role } from '../generated/prisma/index.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: Role;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token não fornecido.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado.');
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    throw new ForbiddenError('Acesso restrito a administradores.');
  }
  next();
}

/**
 * Middleware que exige assinatura ativa (RN-ASS-01).
 * Deve ser aplicado APÓS authenticate.
 */
export async function requireActiveSubscription(req: Request, _res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../config/prisma.js');
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.userId! } });

    if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE')) {
      throw new ForbiddenError('Você precisa de uma assinatura ativa.', 'SUBSCRIPTION_REQUIRED');
    }

    if (subscription.status === 'PAST_DUE') {
      throw new ForbiddenError('Seu pagamento está pendente. Atualize seu método de pagamento para continuar.', 'SUBSCRIPTION_PAST_DUE');
    }

    next();
  } catch (err) {
    next(err);
  }
}
