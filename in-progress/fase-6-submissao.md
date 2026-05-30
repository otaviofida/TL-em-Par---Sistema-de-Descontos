# Fase 6 — Submissão

**Status:** Em revisão nas lojas — aguardando aprovação Apple e Google

---

## Concluído ✅

- [x] App funciona em device físico Android e iOS
- [x] Login, benefícios, histórico, perfil
- [x] QR scanner nativo (ML Kit)
- [x] Push notifications via FCM — Android e iOS funcionando
- [x] Ícone e splash screen gerados (logo 65%) para Android, iOS e PWA
- [x] Safe-area (notch/navbar) corrigida em todas as telas
- [x] PaywallScreen (Reader App — sem Stripe no app)
- [x] Política de privacidade redigida e publicada em tlempar.com.br/privacidade
- [x] Descrição e Review Notes para as lojas redigidos
- [x] Exclusão de conta implementada (exigência Apple 5.1.1)
- [x] Formulário de cancelamento: todos os campos obrigatórios
- [x] Certificado Distribution iOS recriado (nova chave gerada via Xcode após reset do PC)
- [x] **Android v1.2 (build 4)** — em revisão no Google Play
- [x] **iOS v1.5 (build 5)** — enviado para revisão Apple em 2026-05-07

---

## Aguardando ⏳

- [ ] Aprovação Apple → publicar no App Store
- [ ] Aprovação Google → publicar no Google Play

---

## Versões publicadas

| Plataforma | Versão | Build | Data envio | Status |
|------------|--------|-------|------------|--------|
| iOS | 1.5 | 5 | 2026-05-07 | 🔄 Em revisão |
| Android | 1.2 | 4 | 2026-05-07 | 🔄 Em revisão |

---

## Comandos de build (referência rápida)

### Android
```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home
cd "/Volumes/SSD-WORK/TL em par/frontend/android"
./gradlew bundleRelease \
  "-Pandroid.injected.signing.store.file=/Volumes/SSD-WORK/Arquivos TL em Par/tlempar.jks" \
  "-Pandroid.injected.signing.store.password=>x_5RMb5Q,@fuCs:iLU~" \
  -Pandroid.injected.signing.key.alias=tlempar \
  "-Pandroid.injected.signing.key.password=>x_5RMb5Q,@fuCs:iLU~"
```

### iOS
```bash
cd "/Volumes/SSD-WORK/TL em par/frontend/ios/App"

xcodebuild -project App.xcodeproj -scheme App -configuration Release \
  -destination generic/platform=iOS \
  -archivePath /tmp/TLemPar-Distribution.xcarchive \
  archive -allowProvisioningUpdates DEVELOPMENT_TEAM=UV9LKYKF5U

xcodebuild -exportArchive \
  -archivePath /tmp/TLemPar-Distribution.xcarchive \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -exportPath /tmp/TLemPar-AppStore \
  -allowProvisioningUpdates

xcrun altool --upload-app \
  --file "/tmp/TLemPar-AppStore/TL em Par.ipa" \
  --type ios \
  --username "aplicativotlempar@gmail.com" \
  --password "jxhm-qqrb-hcnx-vcgm"
```

Ver **ACESSOS.md** para todas as credenciais completas.
