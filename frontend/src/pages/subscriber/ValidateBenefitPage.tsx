import styled, { keyframes } from 'styled-components';
import { useState, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui';
import { getErrorMessage, getErrorCode } from '../../utils/errorMessages';
import { CheckCircle, XCircle, AlertTriangle, Camera, RotateCcw, QrCode, Smartphone } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef } from 'react';
import { isNative } from '../../utils/platform';
import { openNativeQRScanner } from '../../components/NativeQRScanner';
import type { BenefitValidationResult } from '../../types';

import imgValidation from '../../assets/img-qrcode-validation.png';
import imgValidado from '../../assets/img-qrcode-validado.png';
import imgJaUtilizado from '../../assets/img-qrcode-jautilizado.png';

type ScanStatus = 'idle' | 'scanning' | 'validating' | 'success' | 'error';

const Container = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  text-align: center;
  margin-bottom: 1.5rem;
  span { color: ${({ theme }) => theme.colors.primary}; }
`;

const ScannerWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.dark};
  position: relative;
  aspect-ratio: 1;

  #qr-reader {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    position: relative;
  }

  #qr-reader video {
    width: 100% !important;
    height: 100% !important;
    border-radius: ${({ theme }) => theme.radii.xl};
    object-fit: cover;
  }

  /* Esconde a UI padrão da lib (botões, dashboard, scan region) */
  #qr-reader__dashboard,
  #qr-reader__status_span,
  #qr-reader__header_message,
  #qr-reader img,
  #qr-reader br {
    display: none !important;
  }

  #qr-reader__scan_region {
    position: absolute !important;
    inset: 0 !important;
    min-height: unset !important;
  }

  #qr-reader__scan_region > img {
    display: none !important;
  }
`;

const ScannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const ScanFrame = styled.div`
  width: 220px;
  height: 220px;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
`;

const CameraError = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  p { margin-bottom: 1rem; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const ValidatingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;

  p {
    animation: ${pulse} 1.5s ease-in-out infinite;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
`;

const ResultCard = styled.div<{ $type: 'success' | 'error' | 'warning' }>`
  width: 100%;
  max-width: 400px;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2.5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  background: ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.successBg
      : $type === 'warning'
        ? theme.colors.warningBg
        : theme.colors.errorBg};

  border: 2px solid ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.success
      : $type === 'warning'
        ? theme.colors.warning
        : theme.colors.error};
`;

const ResultIcon = styled.div<{ $type: 'success' | 'error' | 'warning' }>`
  color: ${({ $type, theme }) =>
    $type === 'success'
      ? theme.colors.success
      : $type === 'warning'
        ? theme.colors.warning
        : theme.colors.error};
`;

const ResultTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const ResultMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompanyName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const BenefitText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const IdleState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
`;

const IdleIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.dark};
`;

const ImgValidation = styled.img<{ $scanning?: boolean; $validated?: boolean }>`
  width: 80%;
  height: auto;
  position: absolute;
  bottom: ${({ $scanning, $validated }) => $validated ? '0' : $scanning ? '-120px' : '-50px'};
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  transition: bottom 0.3s ease;

  z-index: 10;
`;

const DesktopMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
`;

const DesktopIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.dark};
`;

export function ValidateBenefitPage() {
  const isMobile = useMemo(() => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent), []);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<BenefitValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning'>('error');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch {}
      scannerRef.current = null;
    }
  }, []);

  const handleScan = useCallback(async (qrToken: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    await stopScanner();

    setStatus('validating');
    try {
      const { data } = await api.post('/benefits/validate', { qrToken });
      setResult(data.data);
      setStatus('success');
    } catch (err) {
      const code = getErrorCode(err);
      setErrorMessage(getErrorMessage(err));
      setErrorType(code === 'BENEFIT_ALREADY_USED' ? 'warning' : 'error');
      setStatus('error');
    } finally {
      processingRef.current = false;
    }
  }, [stopScanner]);

  const resetScanner = useCallback(() => {
    setResult(null);
    setErrorMessage('');
    setCameraError('');
    processingRef.current = false;
    setStatus('idle');
  }, []);

  const startScanner = useCallback(() => {
    setCameraError('');
    if (isNative) {
      setStatus('scanning');
      openNativeQRScanner({
        onScan: handleScan,
        onClose: resetScanner,
        onPermissionDenied: () => {
          setCameraError('Permissão de câmera negada. Acesse Configurações → Aplicativos → TL em Par → Permissões e ative a Câmera.');
          setStatus('idle');
        },
        onModuleInstalling: () => {
          setCameraError('Instalando componente de leitura QR... Aguarde alguns segundos e tente novamente.');
          setStatus('idle');
        },
      });
    } else {
      setStatus('scanning');
    }
  }, [handleScan, resetScanner]);

  useEffect(() => {
    if (status !== 'scanning') return;

    let cancelled = false;

    const initScanner = async () => {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      try {
        await html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            if (!cancelled) handleScan(decodedText);
          },
          () => {},
        );
      } catch (err) {
        if (!cancelled) {
          const isInsecure = window.location.protocol === 'http:' && window.location.hostname !== 'localhost';
          setCameraError(
            isInsecure
              ? 'A câmera requer conexão segura (HTTPS). Acesse o site usando https:// no início do endereço.'
              : 'Não foi possível acessar a câmera. Permita o acesso à câmera nas configurações do navegador e tente novamente.'
          );
          setStatus('idle');
        }
      }
    };

    initScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [status, handleScan, stopScanner]);

  return (
    <Container>
      {!isMobile && !isNative ? (
        <DesktopMessage>
          <DesktopIcon>
            <Smartphone size={36} />
          </DesktopIcon>
          <PageTitle>Validação de <span>benefício</span></PageTitle>
          <p style={{ color: '#666', maxWidth: '400px' }}>
            A validação do QR Code está disponível apenas no celular. Acesse esta página pelo seu smartphone para escanear o código no restaurante.
          </p>
        </DesktopMessage>
      ) : (
        <>
      {status === 'idle' && (
        <IdleState>
          <IdleIcon>
            <QrCode size={36} />
          </IdleIcon>
          <p style={{ color: '#666' }}>
            Escaneie o QR Code no balcão do restaurante para validar seu benefício.
          </p>
          {cameraError && (
            <CameraError>
              <p>{cameraError}</p>
            </CameraError>
          )}
          <Button $size="lg" onClick={startScanner}>
            <Camera size={18} />
            Abrir câmera
          </Button>
        </IdleState>
      )}

      {status === 'scanning' && !isNative && (
        <ScannerWrapper>
          <div id="qr-reader" />
          <ScannerOverlay>
            <ScanFrame />
          </ScannerOverlay>
        </ScannerWrapper>
      )}

      {status === 'validating' && (
        <ValidatingOverlay>
          <QrCode size={48} color="#feb621" />
          <p>Validando seu benefício...</p>
        </ValidatingOverlay>
      )}

      {status === 'success' && result && (
        <>
          <ResultCard $type="success">
            <ResultIcon $type="success"><CheckCircle size={48} /></ResultIcon>
            <ResultTitle>Benefício validado!</ResultTitle>
            <CompanyName>{result.company.name}</CompanyName>
            <BenefitText>{result.benefit}</BenefitText>
            <ResultMessage>
              Apresente esta tela ao garçom. Bom apetite!
            </ResultMessage>
          </ResultCard>
        </>
      )}

      {status === 'error' && (
        <>
          <ResultCard $type={errorType}>
            <ResultIcon $type={errorType}>
              {errorType === 'warning' ? <AlertTriangle size={48} /> : <XCircle size={48} />}
            </ResultIcon>
            <ResultTitle>
              {errorType === 'warning' ? 'Já utilizado' : 'Ops!'}
            </ResultTitle>
            <ResultMessage>{errorMessage}</ResultMessage>
          </ResultCard>
          <Button $variant="outline" onClick={resetScanner} style={{ marginTop: '1.5rem' }}>
            <RotateCcw size={16} />
            Tentar novamente
          </Button>
        </>
      )}

        <ImgValidation $scanning={status === 'scanning'} $validated={status === 'success'} src={status === 'success' ? imgValidado : status === 'error' ? imgJaUtilizado : imgValidation} alt="Exemplo de QR Code para validação" />
        </>
      )}
    </Container>
  );
}
