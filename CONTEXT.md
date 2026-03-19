# TL EM PAR — Contexto do Projeto

## O que é

TL EM PAR é um clube de benefícios gastronômicos por assinatura. Originalmente funcionava com cartões físicos e foi digitalizado como uma plataforma web completa.

## Stack

- **Back-end:** Node.js + Express 5 + Prisma 7 (com adapter-pg) + Zod + JWT + Multer
- **Front-end:** React 19 + Vite 8 + Styled Components + React Query + Zustand + Recharts
- **Pagamento:** Stripe (recorrência via Checkout Sessions + Webhooks)
- **Banco:** PostgreSQL (via @prisma/adapter-pg + pg)
- **QR Code:** html5-qrcode (scanner mobile-only)
- **UI/UX:** Fonte Futura (futura-pt via Adobe Typekit), animações CSS custom, toast notifications (react-hot-toast)
- **Infra futura:** Docker, CI/CD, S3/Cloudinary para uploads

## Tema Visual

| Token | Valor |
|-------|-------|
| primary | #feb621 |
| secondary | #bc7f59 |
| dark | #000000 |
| background | #faf8f5 |
| surface | #ffffff |
| surfaceAlt | #f5f0eb |
| success | #22c55e |
| error | #ef4444 |
| warning | #f59e0b |
| info | #3b82f6 |
| border | #e5ddd4 |
| textSecondary | #666666 |

## Regras de Negócio Principais

1. O usuário precisa de assinatura ativa para usar qualquer benefício
2. O benefício é "compre 1 e ganhe outro"
3. Cada uso é limitado a 1x por empresa por edição
4. Edições são períodos de campanha (ex: março–maio)
5. Validação é feita via QR Code no balcão do restaurante
6. Toda validação gera registro no histórico
7. Reutilização na mesma empresa/edição é bloqueada
8. Empresas pertencem a 1 de 13 categorias gastronômicas

## Fluxo do Assinante

1. Cadastro → 2. Pagamento (Stripe Checkout) → 3. Assinatura ativa → 4. Login → 5. Video splash → 6. Dashboard → 7. Visualiza empresas (filtro por categoria) → 8. Vai ao restaurante → 9. Escaneia QR Code (mobile) → 10. Sistema valida → 11. Sucesso/Bloqueio → 12. Histórico atualizado

## Fluxo Administrativo

1. Login admin → 2. Video splash → 3. Dashboard (métricas) → 4. Gerencia edições → 5. Cadastra empresas (com logo/cover) → 6. Vincula empresas à edição → 7. Acompanha validações → 8. Métricas avançadas (gráficos Recharts)

## Perfis

- **Assinante:** usuário final que paga assinatura e usa benefícios
- **Admin:** gerencia empresas, edições, validações, usuários e assinaturas
- **Empresa (futuro):** login próprio para acompanhar validações

## Integração Stripe

- Checkout Session para assinatura
- Webhooks para confirmar pagamento e atualizar status
- Verificação de sessão (verify-session)
- Cancelamento com acesso até fim do período
- Chaves secretas APENAS no backend (NUNCA no front)
- Front-end recebe apenas a `checkoutUrl` para redirect

## Estrutura do Monorepo

```
TL em par/
├── backend/
│   ├── prisma/              # Schema + migrations
│   ├── src/
│   │   ├── config/          # env, prisma, stripe
│   │   ├── middlewares/     # auth, errorHandler, upload, validate
│   │   ├── modules/
│   │   │   ├── admin/       # Dashboard, métricas, CRUD users/companies/editions
│   │   │   ├── auth/        # Register, login, refresh, me, profile, avatar
│   │   │   ├── benefit/     # Validação QR + histórico
│   │   │   ├── company/     # Listagem pública de empresas
│   │   │   ├── edition/     # CRUD edições + vínculo empresas
│   │   │   └── subscription/# Stripe checkout, webhook, status, cancel
│   │   ├── shared/          # Errors, helpers, types
│   │   └── generated/       # Prisma Client gerado
│   └── uploads/             # Avatars, logos, covers (local)
├── frontend/
│   ├── src/
│   │   ├── assets/          # Imagens, vídeo splash
│   │   ├── components/
│   │   │   ├── layout/      # AdminLayout, UserLayout, AuthLayout, PublicLayout, RouteGuards
│   │   │   ├── ui/          # Badge, Button, Card, EmptyState, Input, Loading, Select
│   │   │   └── VideoSplash.tsx
│   │   ├── constants/       # Categories
│   │   ├── lib/             # api (Axios), checkout, queryClient
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Companies, Editions, Users, Metrics, Subscriptions, Redemptions
│   │   │   ├── public/      # Home, Login, Register, SubscriptionSuccess/Cancelled
│   │   │   └── subscriber/  # Dashboard, Companies, CompanyDetail, History, Profile, ValidateBenefit, Checkout
│   │   ├── stores/          # authStore (Zustand)
│   │   ├── styles/          # theme, global, animations
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # errorMessages, format
│   └── vite.config.ts       # React plugin, basicSsl (HTTPS), proxy /api + /uploads
├── docs/                    # API.md, BUSINESS_RULES.md, FRONTEND_INTEGRATION.md, ROADMAP.md
├── CONTEXT.md               # Este arquivo
└── README.md
```

## Funcionalidades Implementadas

### Área Pública
- Landing page (HomePage)
- Login e Cadastro com animações (scaleIn)

### Área do Assinante
- Dashboard (layout 2 colunas: banner + quick links + perfil com stats)
- Lista de empresas com filtro por categoria (scroll horizontal mobile)
- Detalhe da empresa
- Scanner QR Code (mobile-only, html5-qrcode)
- Tela de resultado da validação (sucesso/erro com imagens)
- Histórico (stat cards + agrupamento por mês)
- Perfil (sidebar com avatar + formulário + cartão assinatura)
- Checkout Stripe

### Área Admin
- Dashboard com métricas resumidas
- CRUD de empresas (grid cards, filtros de status/categoria, upload logo/cover)
- CRUD de edições (grid cards, progress bars, vínculo com empresas)
- Gerenciamento de usuários (listagem + detalhe)
- Gerenciamento de assinaturas
- Histórico geral de validações
- Métricas avançadas (gráficos Recharts)

### Recursos Transversais
- Video splash screen pós-login (VideoSplash via sessionStorage)
- Animações de entrada em todas as páginas (fadeIn, fadeInUp, scaleIn, stagger)
- Dropdown menu animado nos layouts
- Upload de avatar, logo e cover (Multer, armazenamento local)
- React Query para cache de dados
- Zustand para estado de autenticação
- Toast notifications
- Guards de rota (assinatura, auth, público)
- Rate limiting (global + auth + benefit)
- Refresh token automático (interceptor Axios)

## Categorias de Empresas

japonesa, brasileira, marmitex, lanches, pizza, açaí, sorvete, doces, bebidas, saudável, pastel, italiana, padaria

## Convenções

- Nomes de tabelas: PascalCase (Prisma)
- Nomes de endpoints: kebab-case
- Variáveis: camelCase
- Enums: UPPER_SNAKE_CASE
- Respostas API: `{ success: boolean, data?: T, error?: string }`
- Datas: ISO 8601 (UTC)
- IDs: UUID v4
- Componentes estilizados: Styled Components (tagged template literals)
- Animações: keyframes do styled-components (sem lib externa)
- Estado global: Zustand (auth), React Query (server state)

## Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL, PORT (3333), NODE_ENV
JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN (15m), JWT_REFRESH_EXPIRES_IN (7d)
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID
FRONTEND_URL, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL
```

### Frontend (.env)
```
VITE_API_URL=/api
VITE_STRIPE_PRICE_ID
```
