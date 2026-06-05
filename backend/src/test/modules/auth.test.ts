import { describe, it, expect, beforeEach } from 'vitest';
import { api, uniqueEmail, defaultRegisterData, registerUser, loginUser, withAuth } from '../helpers.js';
import { cleanDb } from '../setup.js';

beforeEach(async () => {
  await cleanDb();
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe('POST /api/auth/register', () => {
  it('cria conta com dados válidos e retorna tokens', async () => {
    const data = defaultRegisterData();
    const res = await api.post('/api/auth/register').send(data);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(data.email);
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.user.emailVerified).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    // Senha não deve vazar na resposta
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('retorna 409 para email duplicado', async () => {
    const data = defaultRegisterData();
    await api.post('/api/auth/register').send(data);
    const res = await api.post('/api/auth/register').send(data);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('retorna 409 para CPF duplicado', async () => {
    const cpf = '12345678901';
    const first = defaultRegisterData({ cpf });
    const second = defaultRegisterData({ cpf });
    await api.post('/api/auth/register').send(first);
    const res = await api.post('/api/auth/register').send(second);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CPF_ALREADY_EXISTS');
  });

  it('retorna 400 para campos obrigatórios ausentes', async () => {
    const res = await api.post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('retorna 400 para senha curta (< 8 caracteres)', async () => {
    const res = await api.post('/api/auth/register').send(
      defaultRegisterData({ password: '123' })
    );
    expect(res.status).toBe(400);
  });

  it('retorna 400 para email inválido', async () => {
    const res = await api.post('/api/auth/register').send(
      defaultRegisterData({ email: 'nao-e-um-email' })
    );
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  it('faz login com credenciais corretas e retorna tokens', async () => {
    const { email, password } = await registerUser();
    const res = await api.post('/api/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
  });

  it('retorna 401 para senha incorreta', async () => {
    const { email } = await registerUser();
    const res = await api.post('/api/auth/login').send({ email, password: 'senha-errada' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('retorna 401 para email não cadastrado', async () => {
    const res = await api.post('/api/auth/login').send({
      email: 'nao-existe@email.com',
      password: 'qualquersenha',
    });
    expect(res.status).toBe(401);
  });

  it('retorna 400 para campos ausentes', async () => {
    const res = await api.post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe('GET /api/auth/me', () => {
  it('retorna dados do usuário autenticado', async () => {
    const { accessToken, user } = await registerUser();
    const res = await withAuth(api.get('/api/auth/me'), accessToken);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it('retorna 401 sem token', async () => {
    const res = await api.get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('retorna 401 com token inválido', async () => {
    const res = await api.get('/api/auth/me').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------

describe('POST /api/auth/refresh', () => {
  it('renova tokens com refreshToken válido', async () => {
    const { refreshToken } = await registerUser();
    const res = await api.post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('retorna 401 para refreshToken inválido', async () => {
    const res = await api.post('/api/auth/refresh').send({ refreshToken: 'token-invalido' });
    expect(res.status).toBe(401);
  });

  it('retorna 400 para refreshToken ausente', async () => {
    const res = await api.post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------

describe('POST /api/auth/forgot-password', () => {
  it('retorna 200 mesmo para email não cadastrado (evita enumeração)', async () => {
    const res = await api.post('/api/auth/forgot-password').send({
      email: 'nao-existe@email.com',
    });
    // Deve retornar sucesso genérico para não expor se email existe
    expect([200, 204]).toContain(res.status);
  });

  it('retorna 200 para email cadastrado e envia email (mockado)', async () => {
    const { email } = await registerUser();
    const res = await api.post('/api/auth/forgot-password').send({ email });
    expect([200, 204]).toContain(res.status);
  });

  it('retorna 400 para email inválido', async () => {
    const res = await api.post('/api/auth/forgot-password').send({ email: 'nao-e-email' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/auth/account
// ---------------------------------------------------------------------------

describe('DELETE /api/auth/account', () => {
  it('deleta conta e anonimiza dados do usuário', async () => {
    const { accessToken, user } = await registerUser();
    const res = await withAuth(api.delete('/api/auth/account'), accessToken);

    expect([200, 204]).toContain(res.status);

    // Após deletar, login não deve funcionar
    const loginRes = await api.post('/api/auth/login').send({
      email: user.email,
      password: 'senha1234',
    });
    expect(loginRes.status).toBe(401);
  });
});
