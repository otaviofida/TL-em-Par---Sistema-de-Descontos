# Planning — TL EM PAR

> Última atualização: 14 de abril de 2026

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
| SSL/HTTPS | ❌ Pendente | Domínio sem DNS público (ver seção abaixo) |
| Stripe | ⚠️ Modo teste | Chaves de teste configuradas |

### Credenciais de Teste (Produção)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@tlempar.com.br | admin12345 |
| Usuário | usuario@teste.com | user12345 |

---

## Pendências do Deploy (Domínio)

O domínio temporário `srv19774812.stayx.cloud` **não resolve no DNS público** (NXDOMAIN), impossibilitando SSL. Quando o domínio `tlempar.com.br` estiver disponível:

### 1. Configurar DNS
- Apontar registro **A** de `tlempar.com.br` → `66.253.112.233`
- Apontar registro **A** de `www.tlempar.com.br` → `66.253.112.233`
- Aguardar propagação DNS (até 48h, geralmente minutos)

### 2. Atualizar URLs no docker-compose.yml
```yaml
FRONTEND_URL: https://tlempar.com.br
API_URL: https://tlempar.com.br
STRIPE_SUCCESS_URL: https://tlempar.com.br/assinatura/sucesso
STRIPE_CANCEL_URL: https://tlempar.com.br/assinatura/cancelado
```

### 3. Atualizar Nginx
```bash
ssh root@66.253.112.233
cd ~/tl-em-par
# Restaurar config SSL
cp nginx/conf.d/tlempar.conf.ssl-backup nginx/conf.d/tlempar.conf
# Editar server_name para tlempar.com.br
nano nginx/conf.d/tlempar.conf
nano nginx/conf.d/tlempar-init.conf
```

### 4. Emitir Certificado SSL
```bash
# Primeiro, subir com config HTTP (tlempar-init.conf)
docker compose restart nginx

# Emitir certificado
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d tlempar.com.br -d www.tlempar.com.br \
  --email otaviofida@gmail.com --agree-tos --no-eff-email

# Trocar para config SSL
rm nginx/conf.d/tlempar-init.conf
docker compose restart nginx
```

### 5. Configurar Stripe para Produção
- Criar chaves **live** no Stripe Dashboard
- Atualizar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` no `.env` da VPS
- Configurar webhook endpoint: `https://tlempar.com.br/api/subscriptions/webhook`
- Testar o fluxo completo de pagamento

### 6. Atualizar Webhook do Stripe
- No Stripe Dashboard → Developers → Webhooks
- Endpoint: `https://tlempar.com.br/api/subscriptions/webhook`
- Eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`

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

### Fase 2.1 — Correções Pré-Produção

| Tarefa | Descrição | Prioridade |
|--------|-----------|-----------|
| 2.1.1 | **Email transacional** — Integrar Resend/SendGrid para forgot-password (hoje só loga no console) | Alta |
| 2.1.2 | **Trocar senhas padrão** — Alterar admin12345/user12345 em produção | Alta |
| 2.1.3 | **Upload para S3/Cloudinary** — Uploads locais se perdem no redeploy do container | Alta |
| 2.1.4 | **HTTPS obrigatório** — Configurar domínio + SSL (ver seção acima) | Alta |
| 2.1.5 | **Stripe modo live** — Migrar chaves de teste para produção | Alta |

---

### Fase 2.2 — Melhorias de Produto

| Tarefa | Descrição | Prioridade |
|--------|-----------|-----------|
| 2.2.1 | Confirmação de email no cadastro | Média |
| 2.2.2 | Notificações por email (nova edição, assinatura expirando) | Média |
| 2.2.3 | Soft delete para empresas/edições/usuários | Média |
| 2.2.4 | Auditoria — log de ações do admin | Média |
| 2.2.5 | Relatórios PDF para admin (exportar métricas) | Média |
| 2.2.6 | Filtros avançados no histórico de validações | Baixa |

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
| Recuperação de senha | ✅ Completo (`/auth/forgot-password`, `/auth/reset-password`) | ✅ Páginas prontas (`/esqueci-senha`, `/redefinir-senha/:token`) | ⚠️ **Não envia email** — token só aparece no `console.log` em dev. Precisa integrar serviço de email (Resend/SendGrid) |
| Uploads de imagens | ✅ Multer (local) | ✅ Upload funcional | ⚠️ **Armazenamento local** — volumes Docker persistem, mas S3/Cloudinary é recomendado para escala |

---

## Problemas Conhecidos

| Problema | Impacto | Solução |
|----------|---------|---------|
| `MONTHLY_PRICE = 39.90` hardcoded em `admin.repository.ts` | Métricas de receita ficam fixas | Ler preço real do Stripe ou config |
| UUID para password reset tokens | Aceitável para MVP | Trocar por crypto.randomBytes para mais entropia |
| localStorage para JWT | Padrão SPA, vulnerável a XSS | Migrar para httpOnly cookies quando tiver domínio próprio |
| Sem rate limiting por IP no Nginx | DDos básico | Adicionar `limit_req_zone` no nginx.conf |
| Certbot container rodando loop vazio | Gasta recursos | Parar/remover até ter domínio com SSL |

---

## Ordem de Execução Recomendada

```
1. PWA (2.0)               ✅ Concluído
2. Domínio + SSL (2.1.4)   ← Quando domínio estiver pronto
3. Email transacional (2.1.1) ← Desbloqueia forgot-password
4. Upload S3 (2.1.3)       ← Antes de ter muitos dados
5. Stripe live (2.1.5)     ← Quando for lançar de verdade
6. Testes + Sentry (2.3)   ← Estabilidade pós-lançamento
7. Melhorias (2.2)          ← Iteração contínua
8. Crescimento (3.0)        ← Quando tiver base de usuários
```
