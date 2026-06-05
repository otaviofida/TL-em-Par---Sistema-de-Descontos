import type { Page } from '@playwright/test';

export const ACCESS_TOKEN_KEY = '@tlEmPar:accessToken';
export const REFRESH_TOKEN_KEY = '@tlEmPar:refreshToken';

export const FAKE_TOKENS = {
  access: 'fake-access-token-for-testing',
  refresh: 'fake-refresh-token-for-testing',
};

/**
 * Cenários disponíveis no mock server (e2e/mock-server.ts).
 * Comunicados via header X-Mock-Scenario adicionado pelo Playwright.
 */
export type MockScenario = 'ACTIVE_SUB' | 'NO_SUB' | 'ADMIN' | 'REGISTRATION_DISABLED';

/**
 * Configura autenticação simulada:
 * - Injeta tokens no localStorage antes da primeira navegação
 * - Define header X-Mock-Scenario em TODAS as requests da página
 *   para que o mock server saiba qual usuário/cenário retornar
 */
export async function setupAuth(page: Page, scenario: MockScenario = 'ACTIVE_SUB') {
  // CDP-level: injeta header em todas as requests (XHR + fetch)
  await page.setExtraHTTPHeaders({ 'x-mock-scenario': scenario });

  // Injeta tokens no localStorage antes da primeira navegação
  await page.addInitScript(
    ({ accessKey, refreshKey, accessToken, refreshToken }) => {
      localStorage.setItem(accessKey, accessToken);
      localStorage.setItem(refreshKey, refreshToken);
    },
    {
      accessKey: ACCESS_TOKEN_KEY,
      refreshKey: REFRESH_TOKEN_KEY,
      accessToken: FAKE_TOKENS.access,
      refreshToken: FAKE_TOKENS.refresh,
    }
  );
}
