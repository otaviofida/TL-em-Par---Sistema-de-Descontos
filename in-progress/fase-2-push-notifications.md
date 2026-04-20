# Fase 2 — Push Notifications Nativas

**Status:** Código concluído — aguardando credenciais Firebase

## Código implementado ✅

**Backend:**
- `firebase-admin` instalado
- `backend/src/config/firebase.ts` — init condicional via `FIREBASE_SERVICE_ACCOUNT_JSON`
- `backend/src/config/env.ts` — campo `FIREBASE_SERVICE_ACCOUNT_JSON`
- Migration `20260420000000_add_fcm_token_to_push_subscriptions` — colunas `platform`, `fcm_token`
- `push.repository.ts` — `upsertWeb()` + `upsertDevice()`
- `push.service.ts` — despacha FCM ou VAPID conforme plataforma
- `push.routes.ts` — `POST /push/register-device`

**Frontend:**
- `src/hooks/useMobilePush.ts` — pede permissão + registra token FCM
- `App.tsx` — `useMobilePush()` integrado

## Ações pendentes (você)

### 1. Criar projeto Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Criar projeto → nome: "TL em Par"
3. Adicionar app Android (package: `br.com.tlempar.app`) → baixar `google-services.json`
4. Adicionar app iOS (bundle: `br.com.tlempar.app`) → baixar `GoogleService-Info.plist`
5. Project Settings → Service Accounts → "Generate new private key" → salvar JSON

### 2. Configurar backend
Adicionar no `.env` do VPS:
```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```
(JSON em uma única linha, sem quebras)

### 3. Configurar APNs (iOS)
1. Apple Developer Portal → Certificates → Keys → criar nova key com "Apple Push Notifications"
2. Baixar o `.p8`
3. No Firebase Console → Project Settings → Cloud Messaging → Apple app → upload `.p8`

### 4. Colocar arquivos nativos
```
frontend/android/app/google-services.json       ← copiar aqui
frontend/ios/App/App/GoogleService-Info.plist   ← copiar aqui
```

### 5. Rodar migration no VPS
```bash
npx prisma migrate deploy
```

## Bloqueante para fechar esta fase
- [ ] Firebase configurado + `google-services.json` no projeto Android
- [ ] APNs key configurada no Firebase
- [ ] Push testado em dispositivo físico (iOS e Android)
