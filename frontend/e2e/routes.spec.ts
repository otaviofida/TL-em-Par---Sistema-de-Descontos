import { test, expect } from '@playwright/test';
import { setupAuth } from './helpers';

// ---------------------------------------------------------------------------
// PROTEÇÃO DE ROTAS — SEM AUTENTICAÇÃO
// ---------------------------------------------------------------------------

test.describe('Rotas protegidas — sem autenticação', () => {
  const protectedPaths = ['/painel', '/empresas', '/historico', '/perfil', '/validar'];
  const adminPaths = ['/admin', '/admin/empresas', '/admin/usuarios'];

  for (const path of protectedPaths) {
    test(`${path} sem auth redireciona para /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  }

  for (const path of adminPaths) {
    test(`${path} sem auth redireciona para /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  }
});

// ---------------------------------------------------------------------------
// PROTEÇÃO DE ROTAS — SEM ASSINATURA
// ---------------------------------------------------------------------------

test.describe('Rotas protegidas — sem assinatura', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page, 'NO_SUB');
  });

  test('/painel sem assinatura redireciona para /assinar', async ({ page }) => {
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/assinar/, { timeout: 8000 });
  });

  test('/empresas sem assinatura redireciona para /assinar', async ({ page }) => {
    await page.goto('/empresas');
    await expect(page).toHaveURL(/\/assinar/, { timeout: 8000 });
  });

  test('/historico sem assinatura redireciona para /assinar', async ({ page }) => {
    await page.goto('/historico');
    await expect(page).toHaveURL(/\/assinar/, { timeout: 8000 });
  });

  test('/assinar é acessível sem assinatura (exibe página de checkout)', async ({ page }) => {
    await page.goto('/assinar');
    await expect(page).toHaveURL(/\/assinar/, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /ir para pagamento|pagamento|assinar|assine|começar/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// PROTEÇÃO DE ROTAS — COM ASSINATURA ATIVA
// ---------------------------------------------------------------------------

test.describe('Rotas subscriber — com assinatura ativa', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page, 'ACTIVE_SUB');
  });

  test('/painel é acessível com assinatura ativa', async ({ page }) => {
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/assinar/);
  });

  test('/empresas é acessível com assinatura ativa', async ({ page }) => {
    await page.goto('/empresas');
    await expect(page).toHaveURL(/\/empresas/, { timeout: 8000 });
  });

  test('/assinar com assinatura ativa redireciona para /painel', async ({ page }) => {
    await page.goto('/assinar');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
  });

  test('/login com auth redireciona para /painel', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
  });

  test('/cadastro com auth redireciona para /painel', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// ROTAS ADMIN
// ---------------------------------------------------------------------------

test.describe('Rotas Admin', () => {
  test('acesso negado a /admin para usuário comum → redireciona para /painel', async ({ page }) => {
    await setupAuth(page, 'ACTIVE_SUB');
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
  });

  test('/admin acessível para ADMIN', async ({ page }) => {
    await setupAuth(page, 'ADMIN');
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/, { timeout: 8000 });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/painel/);
  });
});

// ---------------------------------------------------------------------------
// ROTAS PÚBLICAS
// ---------------------------------------------------------------------------

test.describe('Rotas públicas', () => {
  test('/assinatura/sucesso é acessível sem auth', async ({ page }) => {
    await page.goto('/assinatura/sucesso?session_id=cs_test_fake');
    await expect(page).toHaveURL(/\/assinatura\/sucesso/, { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('/assinatura/cancelado é acessível sem auth', async ({ page }) => {
    await page.goto('/assinatura/cancelado');
    await expect(page).toHaveURL(/\/assinatura\/cancelado/, { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/);
  });
});
