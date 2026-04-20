# Fase 1 — Fundação Capacitor ✅

**Concluída em:** Abril 2026

## O que foi feito

- Capacitor 8 + CLI + 8 plugins instalados no `frontend/`
- `capacitor.config.ts` — appId `br.com.tlempar.app`, splash amarelo, status bar #feb621
- Projetos nativos gerados: `frontend/android/` e `frontend/ios/`
- `.env.mobile` — aponta para API de produção
- `vite.config.ts` — modo mobile desativa basicSsl
- `src/utils/platform.ts` — `isNative`, `isIOS`, `isAndroid`
- `src/components/PaywallScreen.tsx` — Reader App D+C implementado
- `src/components/layout/RouteGuards.tsx` — nativo mostra PaywallScreen, web redireciona para /assinar

## Scripts disponíveis

```bash
npm run build:mobile      # build para mobile (sem SSL, .env.mobile)
npm run mobile:sync       # build + cap sync
npm run mobile:android    # build + sync + abre Android Studio
npm run mobile:ios        # build + sync + abre Xcode
```

## Pendente (não bloqueante)

- Testar em emulador/simulador
- Ajustar safe-area após teste visual
