# Roadmap — TL EM PAR

## Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@tlempar.com.br | admin12345 |
| Usuário | usuario@teste.com | user12345 |

---

## MVP (Fase 1) ✅

### Backend
- [x] Estrutura do projeto e config base
- [x] Modelagem Prisma 7 + migrations (adapter-pg)
- [x] Autenticação (register, login, refresh, me, profile update)
- [x] CRUD de empresas (admin)
- [x] CRUD de edições (admin)
- [x] Vínculo empresa ↔ edição
- [x] Listagem de empresas (assinante) com filtro por categoria
- [x] Validação de benefício por QR Code
- [x] Histórico de validações (assinante + admin)
- [x] Integração Stripe (checkout + webhooks + verify-session)
- [x] Dashboard admin básico
- [x] Rate limiting (global + auth + benefit)
- [x] Validação Zod em todas as rotas

### Frontend
- [x] Setup Vite 8 + React 19 + Styled Components
- [x] Tela de login e cadastro
- [x] Fluxo de assinatura (redirect Stripe)
- [x] Guard de assinatura (redireciona para `/assinar` sem assinatura ativa)
- [x] Guard de rota pública (redireciona logado)
- [x] Página de checkout (`/assinar`)
- [x] Registro → checkout Stripe automático
- [x] Painel do assinante (Dashboard com layout 2 colunas)
- [x] Lista de empresas com filtro por categoria
- [x] Detalhe da empresa
- [x] Scanner QR Code (html5-qrcode, mobile-only)
- [x] Tela de resultado da validação
- [x] Histórico do assinante (com agrupamento por mês)
- [x] Perfil do assinante (sidebar + formulário + cartão assinatura)
- [x] Painel admin básico
- [x] CRUD empresas no admin (grid cards + filtros)
- [x] CRUD edições no admin (grid cards + progress bars)

---

## Fase 1.5 — Polish & UX ✅

- [x] Upload de imagens de empresa (logo + cover) via Multer (armazenamento local)
- [x] Upload de avatar do usuário
- [x] Sistema de categorias para empresas (13 categorias)
- [x] Página de métricas admin (gráficos com Recharts)
- [x] Página de gerenciamento de usuários admin
- [x] Página de detalhes do usuário admin
- [x] Página de assinaturas admin
- [x] Página de validações admin (histórico geral)
- [x] Redesign de todas as páginas do assinante (Dashboard, Empresas, Histórico, Perfil)
- [x] Redesign de todas as páginas admin (Companies, Edições)
- [x] Sistema de animações de entrada (fadeIn, fadeInUp, scaleIn, etc.)
- [x] Animações de dropdown e transições nos layouts
- [x] Video splash screen pós-login (VideoSplash component)
- [x] Fonte customizada Futura (futura-pt via Adobe Typekit)
- [x] Tema completo (primary, secondary, success, error, warning, info, surfaces, borders)
- [x] Componentes UI reutilizáveis (Badge, Button, Card, EmptyState, Input, Loading, Select)
- [x] Toast notifications (react-hot-toast)
- [x] React Query para cache e gerenciamento de estado server-side
- [x] Zustand para estado de autenticação

---

## Fase 2 — Melhorias

- [x] Upload de imagens (logo/cover empresa) — ✅ implementado com armazenamento local
- [ ] Migrar uploads para S3 ou Cloudinary (produção)
- [ ] Notificações push / email para novas edições
- [ ] Login de empresa parceira (portal da empresa)
- [ ] Empresa parceira visualiza suas validações
- [ ] Relatórios PDF para admin
- [ ] Filtros avançados no histórico
- [ ] Soft delete para entidades
- [ ] Auditoria (log de ações do admin)
- [ ] Recuperação de senha (forgot password flow)
- [ ] Confirmação de email no cadastro

---

## Fase 3 — Escala

- [ ] App mobile (React Native)
- [x] Sistema de categorias e tags para empresas
- [ ] Gamificação (selos, conquistas por uso)
- [ ] Sistema de indicação (referral)
- [ ] Multi-tenant (franquias/cidades)
- [ ] Cache com Redis
- [ ] Filas com Bull/BullMQ
- [ ] Monitoramento (Sentry, Datadog)
- [ ] Testes automatizados (unitários + integração)
- [ ] CI/CD completo
- [ ] Documentação Swagger/OpenAPI automática
- [ ] Docker / containerização

---

## Fase 4 — Expansão

---

# Próximos Passos

## Prioridade Alta — Pré-produção
- [~] Recuperação de senha (forgot password flow)
- [ ] Testes automatizados (rotas críticas: validação de benefício, autenticação, Stripe)
- [ ] Docker + docker-compose (backend, frontend, PostgreSQL)
- [ ] Migrar uploads para S3 ou Cloudinary
- [ ] Variáveis de ambiente de produção (dev/staging/prod, HTTPS, domínio)

## Prioridade Média — Melhorias de produto
- [ ] Confirmação de email no cadastro
- [ ] Notificações por email (nova edição, assinatura expirando)
- [ ] Soft delete para empresas/edições/usuários
- [ ] Auditoria (log de ações admin)
- [ ] Relatórios PDF para admin

## Prioridade Baixa — Crescimento
- [ ] Portal da empresa parceira
- [ ] Gamificação (selos, conquistas)
- [ ] Sistema de indicação (referral)
- [ ] PWA / App mobile
- [ ] Swagger/OpenAPI automático
