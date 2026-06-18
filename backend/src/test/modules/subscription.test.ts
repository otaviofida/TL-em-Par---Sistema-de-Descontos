import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, registerUser, registerWithActiveSubscription, withAuth } from '../helpers.js';
import { cleanDb } from '../setup.js';

beforeEach(async () => {
  await cleanDb();
});

// ---------------------------------------------------------------------------
// POST /api/subscriptions/checkout
// ---------------------------------------------------------------------------

describe('POST /api/subscriptions/checkout', () => {
  it('retorna URL de checkout do Stripe (mockado)', async () => {
    const { accessToken } = await registerUser();
    const res = await withAuth(api.post('/api/subscriptions/checkout'), accessToken)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.checkoutUrl).toContain('checkout.stripe.com');
    expect(res.body.data.sessionId).toBeDefined();
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await api.post('/api/subscriptions/checkout').send({});
    expect(res.status).toBe(401);
  });

  it('retorna 409 se usuário já tem assinatura ativa', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    const res = await withAuth(api.post('/api/subscriptions/checkout'), accessToken)
      .send({});
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SUBSCRIPTION_ALREADY_ACTIVE');
  });
});

// ---------------------------------------------------------------------------
// POST /api/subscriptions/verify-session
// ---------------------------------------------------------------------------

describe('POST /api/subscriptions/verify-session', () => {
  it('ativa assinatura e retorna status ACTIVE', async () => {
    const { user } = await registerUser();

    // Configura o mock do Stripe para retornar a sessão com o userId correto
    const { stripe } = await import('../../config/stripe.js');
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValueOnce({
      id: 'cs_test_fake_session',
      payment_status: 'paid',
      subscription: 'sub_test_fake',
      customer: 'cus_test_fake',
      client_reference_id: user.id,
      metadata: { userId: user.id },
    } as any);

    const res = await api.post('/api/subscriptions/verify-session')
      .send({ sessionId: 'cs_test_fake_session' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('retorna 400 para sessionId ausente', async () => {
    const res = await api.post('/api/subscriptions/verify-session').send({});
    expect(res.status).toBe(400);
  });

  it('retorna INCOMPLETE quando pagamento não foi concluído', async () => {
    const { user } = await registerUser();
    const { stripe } = await import('../../config/stripe.js');
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValueOnce({
      id: 'cs_test_unpaid',
      payment_status: 'unpaid',
      subscription: null,
      customer: null,
      client_reference_id: user.id,
      metadata: { userId: user.id },
    } as any);

    const res = await api.post('/api/subscriptions/verify-session')
      .send({ sessionId: 'cs_test_unpaid' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INCOMPLETE');
  });
});

// ---------------------------------------------------------------------------
// GET /api/subscriptions/status
// ---------------------------------------------------------------------------

describe('GET /api/subscriptions/status', () => {
  it('retorna null para usuário sem assinatura', async () => {
    const { accessToken } = await registerUser();
    const res = await withAuth(api.get('/api/subscriptions/status'), accessToken);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBeNull();
  });

  it('retorna ACTIVE para usuário com assinatura ativa', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    const res = await withAuth(api.get('/api/subscriptions/status'), accessToken);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await api.get('/api/subscriptions/status');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/subscriptions/cancel
// ---------------------------------------------------------------------------

describe('POST /api/subscriptions/cancel', () => {
  it('agenda cancelamento ao final do período', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    // cancelWithFeedbackSchema: reason (obrigatório), rating (1-5, obrigatório), wouldReturn (enum 'sim'|'talvez'|'nao')
    const res = await withAuth(api.post('/api/subscriptions/cancel'), accessToken)
      .send({ reason: 'Não preciso mais', rating: 3, wouldReturn: 'sim' });

    expect(res.status).toBe(200);
    expect(res.body.data.cancelAtPeriodEnd).toBe(true);
  });

  it('retorna 404 para usuário sem assinatura', async () => {
    const { accessToken } = await registerUser();
    const res = await withAuth(api.post('/api/subscriptions/cancel'), accessToken)
      .send({ reason: 'Teste', rating: 3 });
    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await api.post('/api/subscriptions/cancel').send({ reason: 'Teste' });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/subscriptions/portal
// ---------------------------------------------------------------------------

describe('POST /api/subscriptions/portal', () => {
  it('cria sessão do portal de billing (Stripe mockado)', async () => {
    const { accessToken } = await registerWithActiveSubscription();
    const res = await withAuth(api.post('/api/subscriptions/portal'), accessToken);

    expect(res.status).toBe(200);
    expect(res.body.data.url).toContain('billing.stripe.com');
  });

  it('retorna 404 para usuário sem assinatura', async () => {
    const { accessToken } = await registerUser();
    const res = await withAuth(api.post('/api/subscriptions/portal'), accessToken);
    expect(res.status).toBe(404);
  });
});
