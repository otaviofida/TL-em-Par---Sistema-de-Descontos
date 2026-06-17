import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Share } from 'lucide-react';
import { isNative } from '../utils/platform';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isSamsungBrowser() {
  return /SamsungBrowser/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
    || window.matchMedia('(display-mode: standalone)').matches;
}

const Banner = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    width: calc(100% - 32px);
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
`;

const Icon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const TextWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.p`
  font-weight: 700;
  font-size: 13px;
  margin: 0;
  color: #1a1a1a;
`;

const Subtitle = styled.p`
  font-size: 11px;
  color: #888;
  margin: 2px 0 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const InstallBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.dark};
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;

  &:active {
    opacity: 0.85;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 18px;
  cursor: pointer;
  padding: 2px;
  line-height: 1;

  &:hover {
    color: #666;
  }
`;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [manualPrompt, setManualPrompt] = useState(false);

  useEffect(() => {
    if (isNative) return;
    if (isInStandaloneMode()) return;
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // iOS e Samsung Browser: mostrar instruções manuais de adicionar à tela inicial.
    // Samsung Browser usa servidor próprio de WebAPK que gera APKs com targetSdkVersion
    // baixo, acionando o aviso "App de risco" do Google Play Protect. Instruções manuais
    // criam um atalho simples sem WebAPK e sem o aviso.
    if (isIos() || isSamsungBrowser()) {
      setManualPrompt(true);
      setShow(true);
      return;
    }

    // Chrome/Android: capturar evento nativo
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!show) return null;

  const manualInstructions = isSamsungBrowser()
    ? <>Toque em <strong>☰</strong> → <strong>"Adicionar página a"</strong> → <strong>"Tela inicial"</strong></>
    : <>Toque em <Share size={11} style={{ verticalAlign: 'middle', marginInline: 2 }} /> e depois <strong>"Adicionar à Tela de Início"</strong></>;

  return createPortal(
    <Banner>
      <Icon src="/icons/icon-192x192.png" alt="TL em Par" />
      <TextWrap>
        {manualPrompt ? (
          <>
            <Title>Instalar TL em Par</Title>
            <Subtitle>{manualInstructions}</Subtitle>
          </>
        ) : (
          <>
            <Title>Instalar TL em Par</Title>
            <Subtitle>Acesse direto da tela inicial</Subtitle>
          </>
        )}
      </TextWrap>
      <Actions>
        {!manualPrompt && <InstallBtn onClick={handleInstall}>Instalar</InstallBtn>}
        <CloseBtn onClick={handleDismiss} aria-label="Fechar">×</CloseBtn>
      </Actions>
    </Banner>,
    document.body
  );
}
