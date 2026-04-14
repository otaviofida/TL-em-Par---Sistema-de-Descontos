# Planning — TL EM PAR

> Última atualização: 14 de abril de 2026 (emails + InstallPrompt)

---

## Estado Atual do Deploy

| Item | Status | Observação |
|------|--------|------------|
| VPS (Staycloud) | ✅ Rodando | Ubuntu 24.04, 8GB RAM, IP `66.253.112.233` |
| Docker Compose | ✅ 5 serviços | db, backend, frontend, nginx, certbot |
| PostgreSQL | ✅ Healthy | Migrations aplicadas, seed rodou |
| Backend API | ✅ Rodando | Health check OK, login funcional |
| Frontend SPA | ✅ Rodando | HTML carregando via Nginx |
| PWA | ✅ Instalável | manifest.json, Service Worker, prompt de instalação, tela offline |
| HTTP | ✅ Funcionando | `http://66.253.112.233` |
| SSL/HTTPS | ✅ Funcionando | `https://tlempar.com.br` via Cloudflare (modo Flexible) |
| Domínio | ✅ Ativo | `tlempar.com.br` — DNS via Cloudflare proxy |
| Stripe | ✅ Conta real (modo teste) | Chaves configuradas, webhook ativo, produto R$29,90/mês |
| Resend | ✅ Domínio verificado | `noreply@tlempar.com.br` — emails para qualquer destinatário |
| Cloudinary | ✅ Configurado | Uploads de imagens via Cloudinary (cloud: dokexngyo) |

### Credenciais de Teste (Produção)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@tlempar.com.br | admin12345 |
| Usuário | usuario@teste.com | user12345 |

---

## ~~Pendências do Deploy (Domínio)~~ ✅ Concluído

Todas as pendências de domínio foram resolvidas em 14/04/2026:

- ✅ DNS configurado via Cloudflare (proxy ativo)
- ✅ URLs atualizadas no `docker-compose.yml` para `https://tlempar.com.br`
- ✅ Nginx `server_name` atualizado para `tlempar.com.br`
- ✅ SSL/HTTPS via Cloudflare Flexible (sem Certbot — Cloudflare termina SSL)
- ✅ Frontend + Backend reconstruídos com novas URLs
- ✅ Stripe webhook configurado: `https://tlempar.com.br/api/subscriptions/webhook`
- ✅ Domínio verificado no Resend — `EMAIL_FROM=noreply@tlempar.com.br`
- ✅ Testes de sanidade: HTTPS, login, webhook — todos passando

---

## Próximos Passos — Priorizado

### Fase 2.0 — PWA (Progressive Web App) ✅ Concluída

Frontend transformado em PWA instalável no celular. Implementação manual (sem vite-plugin-pwa — incompatível com Vite 8).

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| 2.0.1 | ~~Instalar `vite-plugin-pwa`~~ — Incompatível com Vite 8, implementado manualmente | ✅ |
| 2.0.2 | `manifest.json` (nome, ícones, cores, orientação, start_url: `/login`) | ✅ |
| 2.0.3 | Ícones PWA (192x192, 512x512, maskable) gerados a partir do logo.png | ✅ |
| 2.0.4 | Service Worker (`sw.js`) com precache de assets essenciais | ✅ |
| 2.0.5 | Splash screen nativa via manifest (background_color + ícone) | ✅ |
| 2.0.6 | Prompt de instalação customizado (`InstallPrompt.tsx`) | ✅ |
| 2.0.7 | Cache: NetworkFirst (API), CacheFirst (assets), fallback offline (HTML) | ✅ |
| 2.0.8 | Tela offline (`offline.html`) com botão "Tentar novamente" | ✅ |
| 2.0.9 | Meta tags iOS (apple-touch-icon, apple-mobile-web-app-capable) | ✅ |
| 2.0.10 | Deploy na VPS e testes | ✅ |

---

### Fase 2.1 — Correções Pré-Produção ✅ Concluída

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| 2.1.1 | **Email transacional** — Resend integrado, template HTML, fallback console.log | ✅ |
| 2.1.2 | **Trocar senhas padrão** — Seed usa env vars (`ADMIN_PASSWORD` / `TEST_USER_PASSWORD`) | ✅ |
| 2.1.3 | **Upload Cloudinary** — Híbrido (Cloudinary quando configurado, local como fallback) | ✅ |
| 2.1.4 | **Stripe conta real** — Conta criada, produto R$29,90/mês, chaves teste configuradas na VPS | ✅ |
| 2.1.5 | **Preço atualizado** — `MONTHLY_PRICE` alterado de R$39,90 para R$29,90 | ✅ |

> **Serviços configurados na VPS (.env):** Resend (domínio verificado), Cloudinary (ativo), Stripe (conta real, modo teste, webhook ativo)

---

### Fase 2.1.5 — Ativação de Domínio ✅ Concluída

Domínio `tlempar.com.br` ativado em 14/04/2026 via Cloudflare.

| # | Tarefa | Status |
|---|--------|--------|
| 1 | Verificar propagação DNS | ✅ Via Cloudflare proxy |
| 2 | Atualizar URLs no `docker-compose.yml` | ✅ `https://tlempar.com.br` |
| 3 | Atualizar `server_name` no Nginx | ✅ `tlempar.com.br www.tlempar.com.br` |
| 4 | SSL/HTTPS | ✅ Cloudflare Flexible (sem Certbot) |
| 5 | Ativar config SSL do Nginx | ✅ N/A — Cloudflare termina SSL |
| 6 | Rebuild frontend + backend | ✅ |
| 7 | Webhook Stripe | ✅ `https://tlempar.com.br/api/subscriptions/webhook` |
| 8 | `STRIPE_WEBHOOK_SECRET` na VPS | ✅ |
| 9 | Verificar domínio no Resend | ✅ |
| 10 | `EMAIL_FROM=noreply@tlempar.com.br` | ✅ |
| 11 | Testes de sanidade | ✅ HTTPS, login, webhook — OK |

---

### Fase 2.2 — Melhorias de Produto ✅ Concluída

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| 2.2.1 | Confirmação de email no cadastro (verificação + boas-vindas) | ✅ |
| 2.2.2 | Notificações por email (nova edição para assinantes, cancelamento de assinatura) | ✅ |
| 2.2.3 | Soft delete para empresas/edições/usuários (`deletedAt`, filtros em queries, restore endpoint) | ✅ |
| 2.2.4 | Auditoria — log de ações do admin (`AuditLog`, `GET /admin/audit-logs`) | ✅ |
| 2.2.5 | Relatórios PDF para admin (`pdfkit`, `GET /admin/reports/metrics/pdf`, botão exportar) | ✅ |
| 2.2.6 | Filtros avançados no histórico de validações (busca, categoria, data) | ✅ |
| 2.2.7 | Email templates com logo e dark theme (layout table-based, header com logo, footer) | ✅ |
| 2.2.8 | InstallPrompt compacto — card 280px no canto inferior direito, fundo branco sutil | ✅ |

---

### Fase 2.3 — Qualidade e Observabilidade

| Tarefa | Descrição | Prioridade |
|--------|-----------|-----------|
| 2.3.1 | Testes automatizados — rotas críticas (auth, benefit, stripe) | Alta |
| 2.3.2 | Monitoramento com Sentry (erros em produção) | Alta |
| 2.3.3 | Logs estruturados (pino/winston em vez de console.log) | Média |
| 2.3.4 | Health check mais completo (checar DB, Stripe, disco) | Baixa |
| 2.3.5 | CI/CD com GitHub Actions (build + test + deploy automático) | Média |
| 2.3.6 | Documentação Swagger/OpenAPI automática | Baixa |

---

### Fase 3.0 — Crescimento

| Tarefa | Descrição | Prioridade |
|--------|-----------|-----------|
| 3.0.1 | Portal da empresa parceira (login próprio, ver validações) | Média |
| 3.0.2 | Cache com Redis (sessões, rate limiting, queries frequentes) | Média |
| 3.0.3 | Gamificação (selos, conquistas por uso) | Baixa |
| 3.0.4 | Sistema de indicação (referral com desconto) | Baixa |
| 3.0.5 | Push notifications (nova edição, lembrete de uso) | Média |
| 3.0.6 | Multi-tenant (franquias/cidades) | Baixa |
| 3.0.7 | App mobile nativo (React Native) | Baixa |

---

## Funcionalidades Implementadas mas Incompletas

| Feature | Backend | Frontend | Pendência |
|---------|---------|----------|-----------|
| Recuperação de senha | ✅ Resend integrado | ✅ Páginas prontas | ✅ Resolvido — Domínio verificado no Resend, emails para qualquer destinatário |
| Uploads de imagens | ✅ Cloudinary + fallback local | ✅ Upload funcional | ✅ Resolvido — Cloudinary configurado na VPS |
| Stripe webhook | ✅ Endpoint pronto | ✅ Checkout funcional | ✅ Resolvido — Webhook configurado em `https://tlempar.com.br/api/subscriptions/webhook` |

---

## Problemas Conhecidos

| Problema | Impacto | Solução |
|----------|---------|---------|
| ~~`MONTHLY_PRICE = 39.90` hardcoded~~ | ~~Métricas fixas~~ | ✅ Corrigido para R$29,90 |
| ~~UUID para password reset tokens~~ | ~~Aceitável para MVP~~ | ✅ Trocado por `crypto.randomBytes(32)` |
| localStorage para JWT | Padrão SPA, vulnerável a XSS | Migrar para httpOnly cookies quando tiver domínio próprio |
| Sem rate limiting por IP no Nginx | DDos básico | Adicionar `limit_req_zone` no nginx.conf |
| ~~Certbot container rodando loop vazio~~ | ~~Gasta recursos~~ | ✅ SSL via Cloudflare — Certbot não necessário |

---

## Ordem de Execução Recomendada

```
1. PWA (2.0)                  ✅ Concluído
2. Melhorias (2.2)             ✅ Concluído (soft delete, auditoria, PDF, filtros)
3. Correções pré-prod (2.1)    ✅ Concluído (Resend, Cloudinary, Stripe conta real, senhas)
4. Ativação domínio (2.1.5)    ✅ Concluído (HTTPS, webhook, Resend domínio, testes OK)
5. Testes + Sentry (2.3)       ← PRÓXIMO — Estabilidade pós-lançamento
6. Crescimento (3.0)            ← Quando tiver base de usuários
```
