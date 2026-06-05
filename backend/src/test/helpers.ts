/**
 * Utilitários para os testes E2E do backend.
 * Cria dados de teste, gera tokens JWT e monta requisições.
 */
import request from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../app.js';

export const api = request(app);

/** Gera email único para evitar conflitos entre testes */
export function uniqueEmail() {
  return `test+${randomUUID().slice(0, 8)}@tlempar.test`;
}

/** Dados padrão de registro de usuário */
export function defaultRegisterData(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Usuário Teste',
    email: uniqueEmail(),
    password: 'senha1234',
    ...overrides,
  };
}

/**
 * Registra um usuário e retorna os tokens.
 * Equivale ao fluxo POST /api/auth/register.
 */
export async function registerUser(overrides: Record<string, unknown> = {}) {
  const data = defaultRegisterData(overrides);
  const res = await api.post('/api/auth/register').send(data);
  if (res.status !== 201) {
    throw new Error(`registerUser falhou: ${JSON.stringify(res.body)}`);
  }
  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    email: data.email as string,
    password: data.password as string,
  };
}

/**
 * Faz login e retorna os tokens.
 */
export async function loginUser(email: string, password: string) {
  const res = await api.post('/api/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`loginUser falhou: ${JSON.stringify(res.body)}`);
  }
  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

/**
 * Adiciona o header Authorization Bearer ao request.
 */
export function withAuth(req: ReturnType<typeof api.get>, token: string) {
  return req.set('Authorization', `Bearer ${token}`);
}

/**
 * Registra + simula assinatura ativa via banco direto (sem Stripe real).
 * Usa o prisma para inserir a subscription diretamente.
 */
export async function registerWithActiveSubscription(overrides: Record<string, unknown> = {}) {
  const { user, accessToken, refreshToken, email, password } = await registerUser(overrides);

  // Inserir assinatura ativa diretamente no banco
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    INSERT INTO subscriptions (
      id, user_id, stripe_customer_id, stripe_subscription_id,
      status, current_period_start, current_period_end,
      cancel_at_period_end, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, 'cus_test_fake', 'sub_test_fake',
      'ACTIVE', NOW(), NOW() + INTERVAL '30 days',
      false, NOW(), NOW()
    )
  `, [user.id]);
  await pool.end();

  return { user, accessToken, refreshToken, email, password };
}
