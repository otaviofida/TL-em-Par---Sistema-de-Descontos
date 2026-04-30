# PRD — TL em Par: App Mobile (App Store + Google Play)

**Status:** In Planning  
**Data:** Abril 2026  
**Responsável:** Otavio Fida  
**Versão:** 1.1  
**Decisão de pagamento:** ✅ Confirmado — Opção D + C (Reader App + browser externo)

---

## 1. VISÃO GERAL

### O que é

O TL em Par é um clube de benefícios gastronômicos por assinatura. Os assinantes têm acesso ao benefício "pague 1 leve 2" em restaurantes parceiros, com validação via QR code.

O produto já existe como aplicação web (SPA React + Vite) com suporte PWA. O objetivo deste PRD é **publicar o app nas lojas App Store (Apple) e Google Play (Android)**, mantendo a base de código existente e sem reescrita.

### Por que agora

- Usuários preferem instalar apps pelas lojas (confiança, atualizações automáticas, melhor UX em iOS)
- Notificações push nativas têm taxa de entrega significativamente maior que web push
- Presença nas lojas aumenta credibilidade e descoberta orgânica
- Concorrentes do setor já têm presença nas lojas

### Abordagem Técnica

**Capacitor (Ionic)** — wrapper nativo sobre o React SPA existente.

Por que Capacitor e não React Native:
- Reusa 100% do código React existente (27 páginas, design system completo)
- Time-to-market estimado de 4–6 semanas vs 4–6 meses para reescrita
- Acesso a APIs nativas: câmera, push, biometria, haptics
- Build para iOS e Android a partir de um único codebase
- A web continua funcionando sem alterações

---

## 2. DECISÃO DE NEGÓCIO — PAGAMENTOS NAS LOJAS ✅ CONFIRMADO

> Decisão tomada: **Opção D + C**. Não há mais opções em aberto aqui.

### Contexto

A Apple exige que compras digitais dentro do app iOS usem o **Apple In-App Purchase (IAP)**, cobrando **30% de comissão**. O Google Play tem regra similar. Processar Stripe diretamente no app resultaria em remoção das lojas.

### Decisão Confirmada: Reader App (D + C)

**Como funciona:**

| Situação do usuário | Experiência no app |
|--------------------|-------------------|
| Não logado | Tela de login/registro normais |
| Logado, assinatura ativa | Acesso completo a todos os benefícios |
| Logado, sem assinatura (ou expirada) | Tela bloqueada com CTA "Assinar pelo site" |
| Logado, assinatura cancelada | Tela bloqueada com CTA "Reativar pelo site" |

**Regra de ouro:** O app **nunca processa nem menciona valores monetários**. Todo fluxo financeiro acontece no browser externo.

### Fluxo UX detalhado — Usuário sem assinatura ativa

```
Abre o app
    ↓
Login (normal)
    ↓
Backend retorna subscription.status ≠ ACTIVE
    ↓
App exibe "Paywall Screen" com:
  - Logo + mensagem "Sua assinatura está inativa"
  - Botão primário: "Assinar agora"  →  abre tlемpar.com.br/assinar no browser externo
  - Botão secundário: "Já assinei" → força refresh do status (pull from API)
  - Link: "Sair da conta"
    ↓
Usuário assina no site (Stripe, fora do app)
    ↓
Retorna ao app → toca "Já assinei" → API confirma ACTIVE → acesso liberado
```

### Por que isso é aceito pela Apple

- **Guideline 3.1.3a (Reader Apps):** Apps que dão acesso a conteúdo previamente adquirido podem direcionar para web para compra, desde que não haja botão de compra dentro do app que leve ao IAP alternativo.
- **Precedentes:** Netflix, Spotify, Kindle, Duolingo, Amazon Prime — todos usam exatamente este modelo.
- **Chave:** o app não pode ter o texto "Assinar por R$ X/mês" — apenas "Assinar pelo site" sem exibir o preço.

### Impacto

- Zero perda de receita (Stripe mantido integralmente)
- Zero complexidade adicional de IAP
- Conforme com App Store Review Guidelines e Google Play Billing Policy

---

## 3. ESCOPO DO MVP DAS LOJAS

### Incluído no MVP

| Feature | Status atual | Ação necessária |
|---------|-------------|-----------------|
| Login / Registro | Web ✅ | Nenhuma (reuso) |
| Dashboard do assinante | Web ✅ | Nenhuma (reuso) |
| Lista de empresas parceiras | Web ✅ | Nenhuma (reuso) |
| Scanner de QR code | Web ✅ html5-qrcode | Substituir por Capacitor Camera (melhor UX nativa) |
| Histórico de benefícios | Web ✅ | Nenhuma (reuso) |
| Perfil do usuário | Web ✅ | Nenhuma (reuso) |
| Avaliações | Web ✅ | Nenhuma (reuso) |
| Notificações in-app | Web ✅ | Nenhuma (reuso) |
| Push notifications | Web Push (limitado) | Migrar para Capacitor Push Notifications (Firebase FCM) |
| Tela de assinatura | Web ✅ | Adaptar: botão abre browser externo |
| Admin dashboard | Web ✅ | Excluído do app mobile (web only) |
| Pull-to-refresh | Web ✅ | Substituir por gesto nativo Capacitor |

### Excluído do MVP (web only)

- Painel administrativo (gestão de empresas, edições, usuários, métricas)
- Fluxo de assinatura com Stripe (redireciona para web)
- Cancelamento de assinatura (redireciona para web)

---

## 4. ARQUITETURA TÉCNICA

### Stack Mobile

```
React 19 (existente) + Vite
        ↓
   Capacitor 7
        ↓
  ┌─────┴─────┐
iOS App    Android App
(Swift/ObjC  (Kotlin/Java
 wrapper)     wrapper)
```

### Capacitor Plugins necessários

| Plugin | Finalidade |
|--------|-----------|
| `@capacitor/camera` | Scanner QR (câmera nativa) |
| `@capacitor/push-notifications` | FCM (Android) + APNs (iOS) |
| `@capacitor/haptics` | Feedback tátil no scan QR |
| `@capacitor/status-bar` | Cor da status bar (amarelo #feb621) |
| `@capacitor/splash-screen` | Splash screen nativa |
| `@capacitor/browser` | Abrir links externos (assinatura Stripe) |
| `@capacitor/app` | Deep links, back button (Android) |
| `@capacitor/network` | Detecção de conectividade offline |

### Push Notifications — Migração

**Situação atual:** Web Push via VAPID (funciona no PWA/Chrome, limitado no iOS Safari)

**Situação nova:** 
- **Android:** Firebase Cloud Messaging (FCM) via Capacitor
- **iOS:** Apple Push Notification Service (APNs) via Capacitor

**Impacto no backend:**
1. Adicionar suporte a FCM tokens (além dos web push endpoints existentes)
2. Integrar Firebase Admin SDK no backend
3. `PushSubscriptions` table já existe — adicionar campo `platform` e `fcmToken`
4. Manter web push para usuários do PWA/browser

### Deep Links

- **iOS:** Associated Domains (`applinks:tlемpar.com.br`)
- **Android:** App Links (`/.well-known/assetlinks.json`)
- Necessário para: redirects do Stripe, verificação de email, links de notificação

### QR Scanner — Migração

Substituir `html5-qrcode` por `@capacitor/camera` + `@zxing/browser`:
- Melhor controle da câmera
- Haptic feedback ao scanear com sucesso
- Sem iframe (melhor performance)

---

## 5. ASSETS NECESSÁRIOS PARA AS LOJAS

### App Store (iOS)

| Asset | Especificação |
|-------|--------------|
| App Icon | 1024×1024px PNG, sem transparência, sem arredondamento |
| Screenshots iPhone 6.9" | 1320×2868px (obrigatório) |
| Screenshots iPhone 6.5" | 1284×2778px |
| Screenshots iPad Pro 13" | 2064×2752px (se suporte iPad) |
| Nome do app | "TL em Par" (até 30 chars) |
| Subtítulo | "Clube de Benefícios" (até 30 chars) |
| Descrição | Até 4000 chars (pt-BR) |
| Palavras-chave | Até 100 chars |
| URL de suporte | site com política de privacidade |
| Política de privacidade | URL obrigatória |

### Google Play

| Asset | Especificação |
|-------|--------------|
| App Icon | 512×512px PNG |
| Feature Graphic | 1024×500px JPG/PNG |
| Screenshots Phone | Mín. 2, máx. 8 (320–3840px) |
| Screenshots Tablet | Recomendado |
| Nome do app | "TL em Par" (até 30 chars) |
| Descrição curta | Até 80 chars |
| Descrição completa | Até 4000 chars |
| Política de privacidade | URL obrigatória |
| Categoria | Food & Drink |

---

## 6. COMPLIANCE — POLÍTICAS DAS LOJAS

### App Store Review Guidelines — Pontos críticos

| Guideline | Como atender | Status |
|-----------|-------------|--------|
| 3.1.1 — In-App Purchase | Nenhum pagamento processado no app. Stripe só via browser externo. | ✅ D+C confirmado |
| 3.1.3a — Reader App | App serve assinantes existentes. Botão "Assinar" abre browser sem exibir preço. | ✅ D+C confirmado |
| 5.1.1 — Privacy | Política de privacidade em pt-BR com URL pública | A fazer |
| 5.1.2 — Data Use | `NSCameraUsageDescription` e `NSUserNotificationsUsageDescription` no Info.plist | A fazer |
| 2.1 — App Completeness | Conta de teste (assinante ACTIVE) fornecida nos Review Notes | A fazer |
| 1.2 — User Interaction | App tem funcionalidade completa: QR, histórico, perfil, notificações | ✅ por design |
| Review Notes | Explicar explicitamente o modelo Reader App ao revisor da Apple | A fazer (Fase 4) |

### Google Play Policies — Pontos críticos

| Policy | Como atender | Status |
|--------|-------------|--------|
| Payments Policy | Nenhuma compra dentro do app. Stripe via browser externo. | ✅ D+C confirmado |
| Camera Permission | `uses-permission CAMERA` com justificativa: scanner QR dos restaurantes | A fazer |
| Privacy Policy | URL da política obrigatória no Play Console | A fazer |
| Target API Level | Android 14 (API 34) mínimo — Capacitor 7 atende por padrão | ✅ automático |

---

## 7. CONFIGURAÇÕES DE DESENVOLVIMENTO

### Arquivos de configuração necessários

#### `capacitor.config.ts`
```typescript
{
  appId: 'br.com.tlempar.app',
  appName: 'TL em Par',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#feb621' },
    StatusBar: { style: 'dark', backgroundColor: '#feb621' }
  }
}
```

#### `android/app/src/main/AndroidManifest.xml` — Permissões
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### `ios/App/App/Info.plist` — Chaves
```
NSCameraUsageDescription → "Usado para escanear QR codes dos restaurantes"
NSUserNotificationsUsageDescription → "Para receber alertas de novos benefícios"
```

### Contas necessárias

| Conta | Custo | Para que |
|-------|-------|---------|
| Apple Developer Program | $99/ano | Publicar na App Store |
| Google Play Developer | $25 único | Publicar no Play Store |
| Firebase Project | Gratuito | FCM push notifications |
| Apple APNs Key | Gratuito (dentro da conta Apple Dev) | Push iOS |

---

## 8. ESTRUTURA DE PASTAS PROPOSTA

```
TL em par/
├── frontend/              (existente — React SPA)
├── backend/               (existente — Node.js API)
├── mobile/                (novo — Capacitor configs + native)
│   ├── android/           (gerado pelo Capacitor)
│   ├── ios/               (gerado pelo Capacitor)
│   ├── capacitor.config.ts
│   └── assets/            (ícones, splash screens)
├── in-planning/           (este documento)
├── in-progress/
└── done/
```

---

## 9. ROADMAP DE EXECUÇÃO

### ✅ Fase 1 — Fundação (CONCLUÍDA)
- [x] Capacitor 8 + CLI instalado no frontend
- [x] `capacitor.config.ts` configurado (appId, splash amarelo, status bar)
- [x] Projetos Android e iOS gerados (`npx cap add android/ios`) com 8 plugins
- [x] Scripts `build:mobile`, `mobile:sync`, `mobile:android`, `mobile:ios` no `package.json`
- [x] `vite.config.ts` com modo mobile (sem basicSsl)
- [x] `.env.mobile` apontando para API de produção
- [x] `src/utils/platform.ts` — `isNative`, `isIOS`, `isAndroid`
- [x] `PaywallScreen` criada (Reader App D+C)
- [x] `RouteGuards.tsx` atualizado: nativo → PaywallScreen, web → redirect /assinar
- [x] **App rodando no emulador Android (Pixel 8 API 37)**
- [ ] **Pendente:** Ajustar safe-area (notch iOS, navbar Android) após teste visual
- [ ] **Pendente:** Testar em dispositivo físico real

### ✅ Fase 2 — Push Notifications Nativas (CONCLUÍDA)
- [x] `firebase-admin` instalado no backend
- [x] `src/config/firebase.ts` — inicialização condicional via `FIREBASE_SERVICE_ACCOUNT_JSON`
- [x] Migration SQL: `platform`, `fcm_token` adicionados; `endpoint/p256dh/auth` tornados opcionais
- [x] `push.repository.ts` — `upsertWeb()` + `upsertDevice()`
- [x] `push.service.ts` — despacha FCM ou VAPID conforme plataforma
- [x] `push.controller.ts` + `push.routes.ts` — nova rota `POST /push/register-device`
- [x] `src/hooks/useMobilePush.ts` — pede permissão, registra token FCM via Capacitor
- [x] `App.tsx` — `useMobilePush()` integrado
- [x] `FIREBASE_SERVICE_ACCOUNT_JSON` configurado no VPS (projeto `tl-em-par`)
- [x] `google-services.json` adicionado ao projeto Android (`br.com.tlempar.app`)
- [x] Firebase BOM 34.12.0 + firebase-messaging no `app/build.gradle`
- [ ] **Pendente:** Configurar APNs key (Apple Developer Portal → Firebase Console) para iOS
- [ ] **Pendente:** Testar push em dispositivo físico

### ✅ Fase 3 — QR Scanner Nativo (CONCLUÍDA)
- [x] Componente `NativeQRScanner.tsx` com `@capacitor-mlkit/barcode-scanning` (ML Kit)
- [x] `ValidateBenefitPage.tsx` atualizado: nativo usa ML Kit, web mantém html5-qrcode
- [x] `@capacitor/haptics` — feedback tátil ao scanear com sucesso
- [x] Desktop bloqueado com mensagem "use o celular"
- [x] CORS do backend corrigido para aceitar origens Capacitor (`https://localhost`, `capacitor://localhost`)
- [x] APK atualizado e funcionando no emulador Android (Pixel 8)

### ✅ Fase 4 — Polimento Mobile (CONCLUÍDA)
- [x] `ProfilePage` — botão "Gerenciar assinatura" abre `tlempar.com.br/perfil` no browser externo no nativo
- [x] Auditoria de preços — nenhuma tela do assinante exibe R$ no nativo
- [x] Safe-area — `viewport-fit=cover`, CSS vars `--safe-area-top/bottom`, aplicadas no `SubscriberLayout` e `AuthLayout`
- [ ] **Pendente:** Criar conta de teste (reviewer@tlempar.com.br, assinante ACTIVE) antes de submeter à Apple

### ✅ Fase 5 — Assets e Loja (CONCLUÍDA)
- [x] Ícone 1024×1024px colocado em `frontend/resources/icon.png`
- [x] Splash screen colocada em `frontend/resources/splash.png`
- [x] `@capacitor/assets generate` — 97 arquivos gerados (87 Android + 10 iOS)
- [x] Política de privacidade redigida → `in-planning/store-assets/politica-de-privacidade.md`
- [x] Descrição das lojas redigida → `in-planning/store-assets/descricao-lojas.md`
- [ ] **Pendente:** Publicar política em `tlempar.com.br/privacidade`
- [ ] **Pendente:** Screenshots (tirar do emulador/dispositivo — mín. 2 por plataforma)
- [ ] **Pendente:** Criar Feature Graphic 1024×500px para Google Play

### Fase 6 — Submissão

#### Pré-requisitos obrigatórios antes de submeter ⚠️
- [ ] Conta **Apple Developer Program** ativa ($99/ano) — https://developer.apple.com/programs/
- [ ] Conta **Google Play Console** ativa ($25 único) — https://play.google.com/console/
- [ ] Política de privacidade publicada em URL pública (`tlempar.com.br/privacidade`)
- [ ] Screenshots do app tiradas (mín. 2 por plataforma, do emulador ou device)
- [ ] Feature Graphic 1024×500px criada para Google Play
- [ ] Conta de teste `reviewer@tlempar.com.br` criada com assinatura ACTIVE
- [ ] Senha da conta de teste preenchida nos Review Notes (`in-planning/store-assets/descricao-lojas.md`)

#### Android — Google Play
- [ ] Gerar keystore de assinatura: `keytool -genkey -v -keystore tlempar.jks -alias tlempar -keyalg RSA -keysize 2048 -validity 10000`
- [ ] Guardar keystore em local seguro (perda = impossível atualizar o app)
- [ ] Build release assinado: `cd android && ./gradlew bundleRelease` → gera `.aab`
- [ ] Criar app no Google Play Console → Internal Testing → upload do `.aab`
- [ ] Preencher ficha da loja (descrição, screenshots, feature graphic, categoria, política)
- [ ] Avançar para Production após testes internos

#### iOS — App Store
- [ ] Configurar APNs Key no Firebase Console (Apple Developer Portal → Keys → APNs)
- [ ] Abrir `frontend/ios` no Xcode: `npx cap open ios`
- [ ] Configurar signing: Team → seu Apple ID, Bundle ID `br.com.tlempar.app`
- [ ] Product → Archive → Distribute App → App Store Connect
- [ ] Criar app no App Store Connect, preencher ficha
- [ ] TestFlight — testar antes de submeter para review
- [ ] Submeter para review com as Review Notes do modelo Reader App

#### Pós-submissão
- [ ] Monitorar review (Apple: 1–7 dias, Google: 1–3 dias)
- [ ] Responder eventuais rejeições com referência à Guideline 3.1.3(a) se necessário

---

## 10. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Apple rejeitar por pagamento | ~~Média~~ **Baixa** | Alto | ✅ Mitigado pela decisão D+C: nenhum Stripe no app, modelo Reader App documentado nos Review Notes |
| Apple pedir conta de teste sem assinatura | Média | Médio | Preparar 2 contas: uma ACTIVE e uma sem assinatura para demonstrar o PaywallScreen |
| Usuário frustrado ao ser redirecionado ao browser | Média | Médio | Copy claro: "Para assinar, acesse nosso site" + botão volta ao app após assinar |
| web push VAPID parar de funcionar | Baixa | Médio | Manter web push (PWA/browser) + FCM nativo (app) em paralelo |
| QR scanner lento no iOS WKWebView | Média | Alto | Usar `@capacitor/camera` nativo ao invés de html5-qrcode |
| styled-components com performance ruim no WebView | Baixa | Médio | Testar em dispositivos entry-level Android (Moto G) antes de submeter |
| App Store Review demorar > 7 dias | Média | Médio | Submeter 2 semanas antes do prazo desejado de lançamento |

---

## 11. MÉTRICAS DE SUCESSO

| Métrica | Meta 30 dias pós-lançamento |
|---------|---------------------------|
| Downloads App Store | > 200 |
| Downloads Google Play | > 300 |
| Taxa de conversão download → login | > 60% |
| Rating médio nas lojas | ≥ 4.2 estrelas |
| Crash-free sessions | ≥ 99% |
| Retenção D7 | > 40% |
| Push notification opt-in | > 70% (vs ~30% web push) |

---

## 12. DEPENDÊNCIAS EXTERNAS

| Dependência | Owner | Prazo necessário |
|-------------|-------|-----------------|
| Apple Developer Account ($99) | Otavio | Antes da Fase 5 |
| Google Play Console ($25) | Otavio | Antes da Fase 6 |
| Projeto Firebase criado | Otavio | Antes da Fase 2 |
| Política de privacidade publicada | Otavio | Antes da Fase 5 |
| Design assets (ícone, screenshots) | Designer/Otavio | Antes da Fase 5 |
| Dispositivos físicos para teste | Otavio | Fase 3–5 |

---

## APÊNDICE — Comparativo de Abordagens Mobile

| Abordagem | Reuso de código | Time to Market | Performance | Acesso a APIs nativas | Recomendado |
|-----------|----------------|----------------|-------------|----------------------|-------------|
| **Capacitor** (proposta) | 95% | 4–6 semanas | Bom | Sim (plugins) | ✅ Sim |
| React Native | 30% | 3–5 meses | Excelente | Sim (nativo) | Não para MVP |
| Expo | 50% | 2–3 meses | Bom | Sim (SDK) | Segunda opção |
| TWA (somente Android) | 100% | 1–2 semanas | PWA | Limitado | Parcial |
| Flutter | 0% | 4–6 meses | Excelente | Sim | Não |
