# Fase 3 — QR Scanner Nativo ✅ CONCLUÍDA

## O que foi feito

- `frontend/src/components/NativeQRScanner.tsx` — usa `@capacitor-mlkit/barcode-scanning` (ML Kit)
- `frontend/src/pages/subscriber/ValidateBenefitPage.tsx` — detecção de plataforma: ML Kit no nativo, html5-qrcode no browser
- `frontend/android/app/build.gradle` — adicionado `com.google.mlkit:barcode-scanning:17.3.0`
- CORS do backend corrigido: `FRONTEND_URL` agora inclui `https://localhost,capacitor://localhost,http://localhost`
- Bug de login "network error" resolvido com o fix de CORS

## Como funciona

No nativo: `openNativeQRScanner()` chama `BarcodeScanner.scan()` que abre a UI nativa do ML Kit. Ao detectar QR, dispara haptic feedback e chama `handleScan()`.

No browser: mantém `html5-qrcode` com overlay personalizado.
