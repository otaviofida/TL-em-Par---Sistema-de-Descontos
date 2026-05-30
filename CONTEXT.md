# TL EM PAR — Contexto do Projeto

## O que é

TL EM PAR é um clube de benefícios gastronômicos por assinatura. Originalmente funcionava com cartões físicos e foi digitalizado como uma plataforma web completa.

## Stack

- **Back-end:** Node.js + Express 5 + Prisma 7 (com adapter-pg) + Zod + JWT + Multer + Firebase Admin
- **Front-end:** React 19 + Vite 8 + Styled Components + React Query + Zustand + Recharts
- **Mobile:** Capacitor 8 (iOS + Android) — package `com.tlempar.app`
- **Pagamento:** Stripe (recorrência via Checkout Sessions + Webhooks) — apenas via browser externo no app
- **Banco:** PostgreSQL (via @prisma/adapter-pg + pg)
- **QR Code:** html5-qrcode (web) + @capacitor-mlkit/barcode-scanning (nativo)
- **Push:** Firebase FCM (Android nativo) + VAPID Web Push (PWA)
- **Email:** Resend
- **Imagens:** Cloudinary (com fallback local)
- **UI/UX:** Fonte Futura (futura-pt via Adobe Typekit), animações CSS custom, toast notifications (react-hot-toast)
- **Infra:** Docker Compose (5 serviços: db, backend, frontend, nginx, certbot), VPS Staycloud Ubuntu 24.04

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
│   ├── prisma/              # Schema + migrations (16 tabelas)
│   ├── src/
│   │   ├── config/          # env, prisma, stripe, firebase, cloudinary, email, webpush
│   │   ├── middlewares/     # auth, errorHandler, upload, validate
│   │   ├── modules/
│   │   │   ├── admin/       # Dashboard, métricas, CRUD users/companies/editions, audit, reports
│   │   │   ├── auth/        # Register, login, refresh, me, profile, avatar, reset password
│   │   │   ├── benefit/     # Validação QR + histórico
│   │   │   ├── company/     # Listagem pública de empresas
│   │   │   ├── edition/     # CRUD edições + vínculo empresas
│   │   │   ├── marketing/   # Push notifications agendadas
│   │   │   ├── notification/# Feed de notificações in-app
│   │   │   ├── push/        # Subscriptions FCM + VAPID
│   │   │   ├── review/      # Avaliações de restaurantes
│   │   │   └── subscription/# Stripe checkout, webhook, status, cancel
│   │   ├── shared/          # Errors, helpers, types
│   │   └── generated/       # Prisma Client gerado
│   └── uploads/             # Avatars, logos, covers (local fallback)
├── frontend/
│   ├── android/             # Projeto Android (Capacitor)
│   ├── ios/                 # Projeto iOS (Capacitor)
│   ├── resources/           # icon.png + splash.png (source para assets nativos)
│   ├── src/
│   │   ├── assets/          # Imagens, vídeo splash, mascote
│   │   ├── components/
│   │   │   ├── layout/      # AdminLayout, UserLayout, AuthLayout, PublicLayout, PublicFooter, RouteGuards
│   │   │   ├── ui/          # Badge, Button, Card, EmptyState, Input, Loading, Select, StarRating
│   │   │   ├── NativeQRScanner.tsx   # ML Kit barcode (Capacitor)
│   │   │   ├── PaywallScreen.tsx     # Tela para não-assinantes no app nativo
│   │   │   ├── InstallPrompt.tsx     # PWA install prompt
│   │   │   └── VideoSplash.tsx
│   │   ├── constants/       # Categories (13 categorias + serviços)
│   │   ├── hooks/           # useMobilePush, usePushSubscription
│   │   ├── lib/             # api (Axios), checkout, queryClient
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Companies, Editions, Users, Metrics, Subscriptions, Redemptions, Reviews, Marketing
│   │   │   ├── public/      # Home, Login, Register, SubscriptionSuccess/Cancelled, Parceiros, Contato, Privacidade
│   │   │   └── subscriber/  # Dashboard, Companies, CompanyDetail, History, Profile, ValidateBenefit, Checkout, Notifications
│   │   ├── stores/          # authStore (Zustand)
│   │   ├── styles/          # theme, global, animations
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # errorMessages, format, platform (isNative/isIOS/isAndroid)
│   ├── capacitor.config.ts  # appId: com.tlempar.app, splash amarelo, FCM, status bar
│   └── vite.config.ts       # React plugin, basicSsl (HTTPS), proxy /api + /uploads
├── docs/                    # API.md, BUSINESS_RULES.md, FRONTEND_INTEGRATION.md, ROADMAP.md, PLANNING.md
├── done/                    # Fases mobile concluídas (1-5)
├── in-progress/             # fase-6-submissao.md
├── in-planning/
│   ├── PRD-mobile-app.md
│   └── store-assets/
│       ├── screenshots/     # 3 capturas do Xiaomi (login, dashboard, QR)
│       ├── feature-graphic.png  # 1024×500px gerado
│       ├── descricao-lojas.md
│       └── politica-de-privacidade.md
├── CONTEXT.md               # Este arquivo
└── README.md
```

## Funcionalidades Implementadas

### Área Pública
- Landing page completa (hero, vantagens, parceiros, como funciona, galeria, CTA, FAQ, footer)
- Login e Cadastro com animações (scaleIn)
- Página /parceiros (grid com busca + filtro por categoria)
- Página /contato (cards de contato + formulário → WhatsApp)
- Página /privacidade (política LGPD completa — obrigatória para lojas)
- Recuperação de senha (email Resend + token)

### Área do Assinante
- Dashboard (banner + quick links + perfil com stats)
- Lista de empresas com filtro por categoria + busca + star ratings
- Detalhe da empresa + avaliações + formulário de review
- Scanner QR Code: html5-qrcode (web) + ML Kit nativo (Capacitor)
- Tela de resultado da validação (sucesso/erro com imagens)
- Histórico (agrupamento por mês)
- Perfil (avatar + formulário + cartão assinatura + cancelamento com feedback)
- Checkout Stripe (redirect para browser externo no app nativo)
- Feed de notificações in-app (badge + paginação)

### Área Admin
- Dashboard com métricas resumidas
- CRUD de empresas (upload logo/cover Cloudinary, filtros)
- CRUD de edições (vínculo com empresas, progress bars)
- Gerenciamento de usuários (listagem + detalhe + histórico)
- Gerenciamento de assinaturas
- Histórico geral de validações (filtros + export PDF)
- Métricas avançadas (gráficos Recharts: bar, pie, line)
- Moderação de avaliações
- Marketing push (agendamento de notificações FCM)
- Audit logs de ações administrativas

### App Mobile (Capacitor)
- Android: **publicado no Google Play** (teste fechado, aguardando revisão) — package `com.tlempar.app`
- iOS: pendente (requer Apple Developer Program)
- PaywallScreen (Reader App — sem Stripe no app, conforme Guideline 3.1.3a)
- Push notifications nativas via FCM (Android)
- QR scanner nativo via ML Kit
- Safe-area (notch/navbar)
- Ícone + splash screen nativos gerados

### PWA
- Service Worker manual (offline fallback)
- Manifest.json (instalável)
- InstallPrompt customizado (iOS + Android)

### Recursos Transversais
- Video splash screen pós-login (VideoSplash via sessionStorage)
- Animações de entrada em todas as páginas (fadeIn, fadeInUp, scaleIn, stagger)
- Upload de avatar, logo e cover (Cloudinary com fallback local)
- React Query para cache de dados
- Zustand para estado de autenticação
- Toast notifications
- Guards de rota (assinatura, auth, público, admin)
- Rate limiting (global + auth + benefit)
- Refresh token automático (interceptor Axios)
- Soft delete + audit logs
- Email verification (Resend)
- Cron scheduler para marketing pushes

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

## Status do App Mobile (2026-05-07)

| Plataforma | Versão | Build | Status |
|------------|--------|-------|--------|
| Android (Google Play) | 1.2 | 4 | 🔄 Em revisão no Google Play — aguardando aprovação |
| iOS (App Store) | 1.5 | 5 | 🔄 Enviado para revisão Apple em 2026-05-07 — aguardando aprovação |

### Mudanças acumuladas desde v1.1

- ✅ Push notifications funcionando no iOS (FCM via `tokenReceived` listener — fix race condition APNs)
- ✅ Formulário de cancelamento: todos os 4 campos obrigatórios (motivo, nota, melhoria, voltaria)
- ✅ Splash screen: logo redimensionada para 65% em Android, iOS e PWA
- ✅ Safe-area corrigida: `env(safe-area-inset-top)` no TopBar e SidebarHeader
- ✅ Horário do benefício exibido como tags por dia da semana
- ✅ Exclusão de conta (exigência Apple 5.1.1)
- ✅ Certificado Distribution recriado (chave perdida após reset do PC — nova gerada via Xcode)

### Pendências — Android
- [ ] Aguardar aprovação Google Play → publicação pública

### Pendências — iOS
- [x] Certificado Distribution recriado e instalado no Keychain
- [x] Archive + Export + Upload realizados (build 5, v1.5)
- [x] Enviado para revisão em 2026-05-07
- [ ] Aguardar aprovação Apple → publicação pública

### Como atualizar o Android
```bash
cd "/Volumes/SSD-WORK/TL em par/frontend"
source ~/.nvm/nvm.sh && nvm use 22   # Capacitor exige Node ≥ 22
npm run mobile:sync
# Incrementar versionCode e versionName em android/app/build.gradle
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
cd android && ./gradlew bundleRelease \
  "-Pandroid.injected.signing.store.file=/Volumes/SSD-WORK/Arquivos TL em Par/tlempar.jks" \
  "-Pandroid.injected.signing.store.password=>x_5RMb5Q,@fuCs:iLU~" \
  -Pandroid.injected.signing.key.alias=tlempar \
  "-Pandroid.injected.signing.key.password=>x_5RMb5Q,@fuCs:iLU~"
# AAB gerado em: android/app/build/outputs/bundle/release/app-release.aab
```

### Como atualizar o iOS
```bash
cd "/Volumes/SSD-WORK/TL em par/frontend"
source ~/.nvm/nvm.sh && nvm use 22 && npm run mobile:sync

# Incrementar CURRENT_PROJECT_VERSION e MARKETING_VERSION em:
# ios/App/App.xcodeproj/project.pbxproj

# Archive
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Release \
  -destination generic/platform=iOS \
  -archivePath /tmp/TLemPar-Distribution.xcarchive \
  archive -allowProvisioningUpdates DEVELOPMENT_TEAM=UV9LKYKF5U

# Export (requer /tmp/ExportOptions.plist — ver ACESSOS.md)
xcodebuild -exportArchive \
  -archivePath /tmp/TLemPar-Distribution.xcarchive \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -exportPath /tmp/TLemPar-AppStore \
  -allowProvisioningUpdates

# Upload
xcrun altool --upload-app \
  --file "/tmp/TLemPar-AppStore/TL em Par.ipa" \
  --type ios \
  --username "aplicativotlempar@gmail.com" \
  --password "jxhm-qqrb-hcnx-vcgm"
```

**Conta de teste para revisores Apple:**
- E-mail: `reviewer@tlempar.com.br`
- Senha: `NDXHccECvru5DVjXxddh`
- Assinatura ACTIVE até 2027-05-01

**QR Code para demonstração Apple Review:**
- Empresa: "Deliciê | Bolos e Doces" — token: `fa090810-19fc-4f85-a047-950d1cea3fa7`
- Arquivo: `/Volumes/SSD-WORK/Arquivos TL em Par/demo-qrcode-apple.png`

**Credenciais de build — ver também ACESSOS.md:**
- Keystore Android: `/Volumes/SSD-WORK/Arquivos TL em Par/tlempar.jks` — alias: `tlempar` — senha: `>x_5RMb5Q,@fuCs:iLU~`
- Apple ID upload: `aplicativotlempar@gmail.com` — app-specific password: `jxhm-qqrb-hcnx-vcgm`
- Apple Team ID: `UV9LKYKF5U` — "Apple Distribution: Moisés Ribas Colmão"

## Infra de Produção

- **URL:** https://tlempar.com.br
- **Servidor:** VPS Staycloud — IP 66.253.112.233, path `/root/tl-em-par`
- **SSL:** Cloudflare Flexible
- **Deploy frontend:** `docker compose build --no-cache frontend && docker compose up -d frontend`
- **Deploy completo:** `git pull && docker compose build --no-cache && docker compose up -d`
- **Java (build Android):** `/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home`
- **Android SDK:** `~/Library/Android/sdk`
- **Keystore:** `/Volumes/SSD-WORK/Arquivos TL em Par/tlempar.jks` — alias: `tlempar`
