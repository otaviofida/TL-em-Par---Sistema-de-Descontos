import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3333,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID!,

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/assinatura/sucesso',
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/assinatura/cancelado',
} as const;
