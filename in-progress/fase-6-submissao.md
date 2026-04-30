# Fase 6 — Submissão

**Status:** Em andamento — app funcionando, aguardando pré-requisitos de loja

---

## O que está pronto ✅

- [x] App funciona em device físico Android (Xiaomi testado)
- [x] Login, benefícios, histórico, perfil ✅
- [x] QR scanner nativo (ML Kit) ✅
- [x] Push notifications via FCM chegando no Android ✅
- [x] Ícone e splash screen gerados para Android e iOS ✅
- [x] Safe-area (notch/navbar) ✅
- [x] PaywallScreen (Reader App — sem Stripe no app) ✅
- [x] Política de privacidade redigida ✅
- [x] Descrição e Review Notes para as lojas redigidos ✅
- [x] APK debug disponível para testes: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Pré-requisitos pendentes (você) ⚠️

- [ ] **Apple Developer Program** ($99/ano) → https://developer.apple.com/programs/
- [ ] **Google Play Console** ($25 único) → https://play.google.com/console/
- [ ] Publicar política em `tlempar.com.br/privacidade` (conteúdo em `in-planning/store-assets/politica-de-privacidade.md`)
- [ ] Screenshots (mín. 2): tirar do Xiaomi ou emulador e salvar em `in-planning/store-assets/screenshots/`
- [ ] Feature Graphic 1024×500px para Google Play (fundo #feb621 + ícone + "Pague 1, Leve 2")
- [ ] Criar conta de teste `reviewer@tlempar.com.br` com assinatura ACTIVE
- [ ] Preencher senha dessa conta em `in-planning/store-assets/descricao-lojas.md` (Review Notes)

---

## Android — Google Play (quando tiver a conta)

- [ ] Gerar keystore — rodar **uma vez**, guardar em local seguro (sem ela não dá para atualizar o app):
  ```bash
  keytool -genkey -v -keystore tlempar.jks -alias tlempar -keyalg RSA -keysize 2048 -validity 10000
  ```

- [ ] Build release assinado:
  ```bash
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  source ~/.nvm/nvm.sh && nvm use 22
  cd frontend/android && ./gradlew bundleRelease
  # Saída: app/build/outputs/bundle/release/app-release.aab
  ```

- [ ] No Google Play Console:
  1. Criar app → "TL em Par" → categoria Gastronomia
  2. Internal Testing → upload `.aab`
  3. Preencher ficha (usar `descricao-lojas.md`)
  4. Testar internamente → Production

---

## iOS — App Store (quando tiver a conta Apple Developer)

- [ ] APNs Key para push iOS:
  1. Apple Developer Portal → Keys → criar key com "Apple Push Notifications service"
  2. Baixar `.p8` → Firebase Console → Project Settings → Cloud Messaging → Apple app → upload

- [ ] Build e submissão:
  ```bash
  source ~/.nvm/nvm.sh && nvm use 22
  cd frontend && npx cap open ios
  ```
  No Xcode: Signing & Capabilities → Team → Bundle ID `br.com.tlempar.app`
  → Product → Archive → Distribute → App Store Connect

- [ ] App Store Connect:
  1. Criar app, preencher ficha (usar `descricao-lojas.md`)
  2. TestFlight → testar antes do review
  3. Submit for Review com Review Notes do modelo Reader App

---

## Pós-submissão

- [ ] Monitorar review (Apple: 1–7 dias, Google: 1–3 dias)
- [ ] Se Apple rejeitar por pagamento: responder citando Guideline 3.1.3(a) — Reader App
- [ ] Após aprovação: anunciar lançamento
