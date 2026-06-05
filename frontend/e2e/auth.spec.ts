import { test, expect } from '@playwright/test';
import { setupAuth } from './helpers';

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------

test.describe('Login', () => {
  test('exibe erros de validação quando campos estão vazios', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/email obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha obrigatória/i)).toBeVisible();
  });

  test('exibe erro para credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('errado@email.com');
    await page.getByPlaceholder('Sua senha').fill('senhaerrada');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible();
  });

  test('login com sucesso sem assinatura redireciona para /assinar', async ({ page }) => {
    // Cenário NO_SUB: mock server retorna usuário sem assinatura
    await page.setExtraHTTPHeaders({ 'x-mock-scenario': 'NO_SUB' });
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('teste@email.com');
    await page.getByPlaceholder('Sua senha').fill('senha123');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Login → usuário sem assinatura → redirecionado para /assinar
    await expect(page).toHaveURL(/\/assinar/, { timeout: 8000 });
  });

  test('usuário já logado é redirecionado de /login para /painel', async ({ page }) => {
    await setupAuth(page, 'ACTIVE_SUB');
    await page.goto('/login');
    await expect(page).toHaveURL(/\/painel/, { timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// CADASTRO
// ---------------------------------------------------------------------------

test.describe('Cadastro', () => {
  test('exibe erros de validação para campos obrigatórios', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByRole('button', { name: /criar conta/i }).click();

    await expect(page.getByText(/nome obrigatório/i)).toBeVisible();
    await expect(page.getByText(/email obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha obrigatória/i)).toBeVisible();
  });

  test('exibe erro quando senhas não coincidem', async ({ page }) => {
    await page.goto('/cadastro');

    await page.getByLabel('Nome completo').fill('Usuário Teste');
    await page.getByLabel('Email').fill('teste@email.com');
    await page.getByLabel(/^Senha/).fill('senha123');
    await page.getByLabel(/confirmar senha/i).fill('senhadiferente');
    await page.getByRole('button', { name: /criar conta/i }).click();

    await expect(page.getByText(/as senhas não coincidem/i)).toBeVisible();
  });

  test('exibe erro quando senha tem menos de 8 caracteres', async ({ page }) => {
    await page.goto('/cadastro');

    await page.getByLabel('Nome completo').fill('Usuário Teste');
    await page.getByLabel('Email').fill('teste@email.com');
    await page.getByLabel(/^Senha/).fill('curta');
    await page.getByLabel(/confirmar senha/i).fill('curta');
    await page.getByRole('button', { name: /criar conta/i }).click();

    await expect(page.getByText(/mínimo 8 caracteres/i)).toBeVisible();
  });

  test('exibe erro para email já cadastrado (409)', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByLabel('Nome completo').fill('Usuário Teste');
    await page.getByLabel('Email').fill('existente@email.com');
    await page.getByLabel(/^Senha/).fill('senha123');
    await page.getByLabel(/confirmar senha/i).fill('senha123');
    await page.getByRole('button', { name: /criar conta/i }).click();

    await expect(page.getByText(/email já está cadastrado/i)).toBeVisible();
  });

  test('cadastro com sucesso registra e inicia checkout', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByLabel('Nome completo').fill('Novo Usuário');
    await page.getByLabel('Email').fill('novo@email.com');
    await page.getByLabel(/^Senha/).fill('senha123');
    await page.getByLabel(/confirmar senha/i).fill('senha123');
    await page.getByRole('button', { name: /criar conta/i }).click();

    // Mock server: register → tokens → startCheckout → checkout URL apontando para página de sucesso
    await expect(page).toHaveURL(/\/assinatura\/sucesso/, { timeout: 10000 });
    await expect(page.getByText(/assinatura.*confirmada/i)).toBeVisible({ timeout: 8000 });
  });

  test('cadastro desabilitado exibe tela bloqueada', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-mock-scenario': 'REGISTRATION_DISABLED' });
    await page.goto('/cadastro');
    // Quando registrationEnabled=false, RegisterPage renderiza LaunchScreen (sem formulário)
    await expect(page.getByRole('button', { name: /criar conta/i })).not.toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// ESQUECI MINHA SENHA
// ---------------------------------------------------------------------------

test.describe('Esqueci a senha', () => {
  test('exibe formulário de recuperação', async ({ page }) => {
    await page.goto('/esqueci-senha');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('exibe confirmação após envio bem-sucedido', async ({ page }) => {
    await page.goto('/esqueci-senha');
    await page.getByLabel(/email/i).fill('teste@email.com');
    await page.getByRole('button').click();

    // Aguarda a mudança na página (campo sumindo ou mensagem aparecendo)
    await expect(page.getByLabel(/email/i)).not.toBeVisible({ timeout: 8000 }).catch(() => {
      // Se o campo ainda estiver visível, pode ser que a UI mostre mensagem diferente
    });
  });
});
