/**
 * Servidor mock simples para testes E2E.
 * Roda na porta 3333 (destino do proxy do Vite) e responde os endpoints
 * que o frontend precisa. Comportamento por rota é configurável via
 * header X-Mock-Scenario enviado pelo helper de testes.
 */
import * as http from 'http';

const PORT = 3333;

const FAKE_TOKENS = {
  access: 'fake-access-token-for-testing',
  refresh: 'fake-refresh-token-for-testing',
};

const USERS = {
  NO_SUB: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Usuário Teste',
    email: 'sem-assinatura@tlempar.com.br',
    role: 'USER',
    emailVerified: true,
    subscription: null,
  },
  ACTIVE_SUB: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Assinante Teste',
    email: 'assinante@tlempar.com.br',
    role: 'USER',
    emailVerified: true,
    subscription: {
      status: 'ACTIVE',
      currentPeriodEnd: '2027-01-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
    },
  },
  ADMIN: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Admin Teste',
    email: 'admin@tlempar.com.br',
    role: 'ADMIN',
    emailVerified: true,
    subscription: null,
  },
};

function ok(res: http.ServerResponse, data: unknown) {
  const body = JSON.stringify({ success: true, data });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(body);
}

function err(res: http.ServerResponse, status: number, message: string, code?: string) {
  const body = JSON.stringify({ success: false, error: { message, code } });
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
  });
}

function getScenario(req: http.IncomingMessage): string {
  return (req.headers['x-mock-scenario'] as string) || 'ACTIVE_SUB';
}

function getUser(scenario: string) {
  return USERS[scenario as keyof typeof USERS] ?? USERS.ACTIVE_SUB;
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const scenario = getScenario(req);

  // Remove /api prefix (Vite proxy mantém o prefixo)
  const path = url?.replace(/^\/api/, '') ?? '/';

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (path === '/auth/me' && method === 'GET') {
    const token = req.headers['authorization'];
    if (!token) return err(res, 401, 'Não autorizado.', 'UNAUTHORIZED');
    return ok(res, getUser(scenario));
  }

  if (path === '/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const { email } = JSON.parse(body || '{}');
    if (email === 'errado@email.com') {
      return err(res, 401, 'Credenciais inválidas.', 'INVALID_CREDENTIALS');
    }
    const user = scenario === 'NO_SUB' ? USERS.NO_SUB : USERS.ACTIVE_SUB;
    return ok(res, { user, ...FAKE_TOKENS });
  }

  if (path === '/auth/register' && method === 'POST') {
    const body = await readBody(req);
    const { email } = JSON.parse(body || '{}');
    if (email === 'existente@email.com') {
      return err(res, 409, 'Este email já está cadastrado.', 'EMAIL_ALREADY_EXISTS');
    }
    return ok(res, { user: USERS.NO_SUB, ...FAKE_TOKENS });
  }

  if (path === '/auth/refresh' && method === 'POST') {
    return ok(res, FAKE_TOKENS);
  }

  if (path === '/auth/forgot-password' && method === 'POST') {
    return ok(res, { message: 'Email enviado.' });
  }

  // ── Subscription ──────────────────────────────────────────────────────────
  if (path === '/subscriptions/checkout' && method === 'POST') {
    return ok(res, {
      checkoutUrl: 'http://localhost:5173/assinatura/sucesso?session_id=cs_test_e2e',
      sessionId: 'cs_test_e2e',
    });
  }

  if (path === '/subscriptions/verify-session' && method === 'POST') {
    const body = await readBody(req);
    const { sessionId } = JSON.parse(body || '{}');
    if (!sessionId) return err(res, 400, 'Sessão inválida.', 'INVALID_SESSION');
    if (sessionId === 'cs_invalid') return err(res, 400, 'Sessão inválida.', 'INVALID_SESSION');
    if (sessionId === 'cs_test_pending') return ok(res, { status: 'INCOMPLETE' });
    return ok(res, { status: 'ACTIVE', message: 'Assinatura ativada com sucesso.' });
  }

  if (path === '/subscriptions/status' && method === 'GET') {
    const user = getUser(scenario);
    return ok(res, { status: user.subscription?.status ?? null });
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  if (path === '/settings' && method === 'GET') {
    const disabled = scenario === 'REGISTRATION_DISABLED';
    return ok(res, { registrationEnabled: !disabled });
  }

  // ── Notifications ────────────────────────────────────────────────────────
  if (path === '/notifications/unread-count' && method === 'GET') {
    return ok(res, { count: 0 });
  }
  if (path.startsWith('/notifications') && method === 'GET') {
    return ok(res, []);
  }

  // ── Admin ────────────────────────────────────────────────────────────────
  if (path.startsWith('/admin')) {
    return ok(res, { stats: {}, items: [], total: 0 });
  }

  // ── Benefits / Companies ─────────────────────────────────────────────────
  if (path.startsWith('/benefits') || path.startsWith('/companies')) {
    return ok(res, { items: [], total: 0 });
  }

  // Fallback
  err(res, 404, `Mock não configurado: ${method} ${path}`);
});

server.listen(PORT, () => {
  process.stdout.write(`Mock server rodando na porta ${PORT}\n`);
});
