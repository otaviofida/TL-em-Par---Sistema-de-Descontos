import { describe, it, expect } from 'vitest';
import { api } from '../helpers.js';

// ---------------------------------------------------------------------------
// GET /api/settings
// ---------------------------------------------------------------------------

describe('GET /api/settings', () => {
  it('retorna configurações públicas sem autenticação', async () => {
    const res = await api.get('/api/settings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Deve incluir ao menos registrationEnabled
    expect(res.body.data).toHaveProperty('registrationEnabled');
  });
});

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------

describe('GET /api/health', () => {
  it('retorna status ok', async () => {
    const res = await api.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
  });
});
