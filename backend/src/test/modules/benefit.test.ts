import { describe, it, expect, beforeEach } from 'vitest';
import { api, registerUser, registerWithActiveSubscription, withAuth } from '../helpers.js';
import { cleanDb } from '../setup.js';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Cria empresa + edição ativa + vincula para uso nos testes de benefício */
async function setupCompanyAndEdition(userId: string) {
  const qrToken = randomUUID();

  // Cria empresa ativa
  const { rows: [company] } = await pool.query(`
    INSERT INTO companies (id, name, description, category, address, qr_token, status, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Restaurante Teste', 'Descrição', 'Restaurante', 'Rua Teste, 1', $1, 'ACTIVE', NOW(), NOW())
    RETURNING id
  `, [qrToken]);

  // Cria edição ativa
  const { rows: [edition] } = await pool.query(`
    INSERT INTO editions (id, name, status, start_date, end_date, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Edição Teste', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', NOW(), NOW())
    RETURNING id
  `);

  // Vincula empresa à edição
  await pool.query(`
    INSERT INTO company_editions (id, company_id, edition_id, created_at)
    VALUES (gen_random_uuid(), $1, $2, NOW())
  `, [company.id, edition.id]);

  return { companyId: company.id as string, editionId: edition.id as string, qrToken };
}

beforeEach(async () => {
  await cleanDb();
});

// ---------------------------------------------------------------------------
// POST /api/benefits/validate
// ---------------------------------------------------------------------------

describe('POST /api/benefits/validate', () => {
  it('valida benefício com QR Code válido (assinatura ativa)', async () => {
    const { accessToken, user } = await registerWithActiveSubscription();
    const { qrToken } = await setupCompanyAndEdition(user.id);

    const res = await withAuth(api.post('/api/benefits/validate'), accessToken)
      .send({ qrToken });

    expect(res.status).toBe(200);
    expect(res.body.data.company).toBeDefined();
    expect(res.body.data.redemptionId).toBeDefined();
    expect(res.body.data.redeemedAt).toBeDefined();
  });

  it('retorna 403 sem assinatura ativa', async () => {
    const { accessToken, user } = await registerUser();
    const { qrToken } = await setupCompanyAndEdition(user.id);

    const res = await withAuth(api.post('/api/benefits/validate'), accessToken)
      .send({ qrToken });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('SUBSCRIPTION_REQUIRED');
  });

  it('retorna 404 para QR Token (UUID válido) que não existe no banco', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    // Schema exige UUID — usamos um UUID válido que não existe em nenhuma empresa
    const res = await withAuth(api.post('/api/benefits/validate'), accessToken)
      .send({ qrToken: randomUUID() });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('INVALID_QR_TOKEN');
  });

  it('retorna 409 ao tentar usar benefício já usado na edição', async () => {
    const { accessToken, user } = await registerWithActiveSubscription();
    const { qrToken } = await setupCompanyAndEdition(user.id);

    // Primeira validação — deve funcionar
    await withAuth(api.post('/api/benefits/validate'), accessToken).send({ qrToken });

    // Segunda validação — deve falhar
    const res = await withAuth(api.post('/api/benefits/validate'), accessToken)
      .send({ qrToken });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('BENEFIT_ALREADY_USED');
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await api.post('/api/benefits/validate').send({ qrToken: 'qualquer' });
    expect(res.status).toBe(401);
  });

  it('retorna 400 para qrToken ausente', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    const res = await withAuth(api.post('/api/benefits/validate'), accessToken).send({});
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/benefits/history
// ---------------------------------------------------------------------------

describe('GET /api/benefits/history', () => {
  it('retorna histórico vazio para usuário sem validações', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    const res = await withAuth(api.get('/api/benefits/history'), accessToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data).toHaveLength(0);
  });

  it('retorna histórico após validação', async () => {
    const { accessToken, user } = await registerWithActiveSubscription();
    const { qrToken } = await setupCompanyAndEdition(user.id);

    await withAuth(api.post('/api/benefits/validate'), accessToken).send({ qrToken });

    const res = await withAuth(api.get('/api/benefits/history'), accessToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].company).toBeDefined();
    expect(res.body.data[0].redeemedAt).toBeDefined();
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await api.get('/api/benefits/history');
    expect(res.status).toBe(401);
  });
});
