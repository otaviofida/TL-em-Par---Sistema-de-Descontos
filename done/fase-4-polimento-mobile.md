# Fase 4 — Polimento Mobile

**Status:** Em andamento

## Tarefas

- [x] `ProfilePage` — botão "Gerenciar assinatura" abre `tlempar.com.br/perfil` no browser externo no nativo; "Cancelar assinatura" mantido apenas no web
- [x] Safe-area — `viewport-fit=cover` no `index.html`; CSS vars `--safe-area-top/bottom` no `global.ts`; `HeaderWrapper` e `Main` do `SubscriberLayout` usam as vars; `AuthLayout` também protegido
- [x] Auditoria de preços — nenhuma tela do assinante exibe R$; `/assinar` é inacessível no nativo via PaywallScreen + RouteGuard
- [x] APK atualizado e deployado no emulador (Pixel 8)
