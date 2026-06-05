import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
    fileParallelism: false,
    // Variáveis de ambiente definidas antes de qualquer módulo ser carregado
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/tlempar_test',
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-min-32-chars-long!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars!!',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      STRIPE_SECRET_KEY: 'sk_test_fake',
      STRIPE_WEBHOOK_SECRET: 'whsec_fake',
      STRIPE_PRICE_ID: 'price_fake',
      STRIPE_SUCCESS_URL: 'http://localhost:5173/assinatura/sucesso',
      STRIPE_CANCEL_URL: 'http://localhost:5173/assinatura/cancelado',
      FRONTEND_URL: 'http://localhost:5173',
      API_URL: 'http://localhost:3333',
      RESEND_API_KEY: 'fake-resend-key',
      EMAIL_FROM: 'test@tlempar.com.br',
      CLOUDINARY_CLOUD_NAME: 'fake',
      CLOUDINARY_API_KEY: 'fake',
      CLOUDINARY_API_SECRET: 'fake',
    },
  },
});
