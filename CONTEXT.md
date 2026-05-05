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

## Status do App Mobile (2026-05-05)

| Plataforma | Versão | Status |
|------------|--------|--------|
| Android (Google Play) | 1.1 (versionCode 2) | ✅ Teste fechado Alpha ativo — 14 dias a contar de ~2026-04-30 |
| iOS (App Store) | 1.1 (Build 4) | 🔄 Reenviado para revisão App Store em 2026-05-05 — aguardando Apple |

### Rejeição Apple (Build 3) e correções aplicadas (Build 4)

Build 3 foi rejeitada em 2026-05-05 com 4 problemas:

**5.1.1 — Exclusão de conta (CORRIGIDO):**
- Backend: `DELETE /api/auth/account` — cancela assinatura Stripe imediatamente + soft-delete do usuário
- Frontend: seção "Zona de perigo" no ProfilePage com confirmação em 2 etapas
- Deploy feito em produção (web) + Build 4 submetida

**2.1.0 — QR Code para demonstração (RESOLVIDO nas Notes):**
- QR code da empresa "Deliciê | Bolos e Doces" (token: `fa090810-19fc-4f85-a047-950d1cea3fa7`) enviado no campo Anexo do App Review Information
- Arquivo: `~/Desktop/demo-qrcode-apple.png`

**2.1 — Conta com assinatura expirada (CRIADA):**
- E-mail: `demo-expired@tlempar.com.br` / Senha: `AppleReview2026!`
- Subscription status: CANCELED, expirada em 2026-04-01
- Informado nas Notes do App Review Information

**2.1(b) — Modelo de negócio (EXPLICADO nas Notes):**
- Assinaturas via Stripe no site (não usa Apple IAP)
- App é companion de assinatura web (modelo Netflix/Spotify)

### Mudanças na versão 1.1
- App abre direto na tela de login (não exibe home pública no app nativo)
- iOS: `NSPhotoLibraryUsageDescription` adicionado ao Info.plist
- iOS: `ITSAppUsesNonExemptEncryption = false` adicionado ao Info.plist
- iOS: `GoogleService-Info.plist` adicionado ao projeto (Firebase iOS)
- Firebase: APNs Key `6D5L7BW87G` configurada (Sandbox & Production)
- Build 4: exclusão de conta implementada (exigência Apple 5.1.1)

### Pendências — Android
- [ ] Recrutar 20 testadores (exigência Google para avançar para produção)
- [ ] Completar 14 dias de teste ativo (prazo ~2026-05-14)
- [ ] Após 14 dias → solicitar publicação em Produção no Google Play Console
- [ ] Preencher ficha completa da loja (screenshots, descrição)

### Pendências — iOS
- [x] TestFlight externo aprovado — testadores instalaram com sucesso
- [x] Ficha App Store preenchida (descrição, palavras-chave, screenshots, classificação 4+)
- [x] APNs Key configurada no Firebase
- [x] Build 3 rejeitada e corrigida — Build 4 reenviada em 2026-05-05
- [ ] Aguardar aprovação Apple → publicação pública

### Como atualizar o Android
```bash
cd "/Users/otaviofida/Desktop/TL em par/frontend"
source ~/.nvm/nvm.sh && nvm use 22   # Capacitor exige Node ≥ 22
npm run mobile:sync
# Incrementar versionCode e versionName em android/app/build.gradle
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
cd android && ./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=/Users/otaviofida/Desktop/tlempar.jks \
  "-Pandroid.injected.signing.store.password=>x_5RMb5Q,@fuCs:iLU~" \
  -Pandroid.injected.signing.key.alias=tlempar \
  "-Pandroid.injected.signing.key.password=>x_5RMb5Q,@fuCs:iLU~"
# AAB gerado em: android/app/build/outputs/bundle/release/app-release.aab
```

### Como atualizar o iOS
```bash
cd "/Users/otaviofida/Desktop/TL em par/frontend"
source ~/.nvm/nvm.sh && nvm use 22 && npm run mobile:sync

# Archive (incrementar CURRENT_PROJECT_VERSION a cada envio)
xcodebuild archive \
  -workspace "ios/App/App.xcodeproj/project.xcworkspace" \
  -scheme App -configuration Release \
  -archivePath /tmp/tlempar-vX.xcarchive \
  -allowProvisioningUpdates \
  CURRENT_PROJECT_VERSION=X MARKETING_VERSION=1.1

# Export (requer /tmp/ExportOptions.plist com teamID UV9LKYKF5U)
xcodebuild -exportArchive \
  -archivePath /tmp/tlempar-vX.xcarchive \
  -exportPath /tmp/tlempar-exportX \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -allowProvisioningUpdates

# Upload
xcrun altool --upload-app \
  -f "/tmp/tlempar-exportX/TL em Par.ipa" \
  -t ios -u "aplicativotlempar@gmail.com" -p "xuxs-hxeg-ebnf-lkzo"
```

**Conta de teste para revisores:**
- E-mail: `reviewer@tlempar.com.br`
- Senha: `NDXHccECvru5DVjXxddh`
- Assinatura ACTIVE até 2027-05-01

**Credenciais de build:**
- Keystore Android: `~/Desktop/tlempar.jks` — alias: `tlempar` — senha: `>x_5RMb5Q,@fuCs:iLU~`
- Apple ID upload: `aplicativotlempar@gmail.com` — app-specific password: `xuxs-hxeg-ebnf-lkzo`
- Apple Team ID: `UV9LKYKF5U`

## Infra de Produção

- **URL:** https://tlempar.com.br
- **Servidor:** VPS Staycloud — IP 66.253.112.233, path `/root/tl-em-par`
- **SSL:** Cloudflare Flexible
- **Deploy frontend:** `docker compose build --no-cache frontend && docker compose up -d frontend`
- **Deploy completo:** `git pull && docker compose build --no-cache && docker compose up -d`
- **Java (build Android):** `/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home`
- **Android SDK:** `~/Library/Android/sdk`
- **Keystore:** `~/Desktop/tlempar.jks` — alias: `tlempar`
