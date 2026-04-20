import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isAndroid } from '../utils/platform';

interface NativeQRScannerProps {
  onScan: (token: string) => void;
  onClose: () => void;
  onPermissionDenied?: () => void;
  onModuleInstalling?: () => void;
}

async function checkCameraPermission(onPermissionDenied?: () => void, onClose?: () => void): Promise<boolean> {
  const { camera } = await BarcodeScanner.checkPermissions();
  if (camera === 'denied') {
    onPermissionDenied?.();
    onClose?.();
    return false;
  }
  if (camera !== 'granted') {
    const { camera: granted } = await BarcodeScanner.requestPermissions();
    if (granted !== 'granted') {
      onPermissionDenied?.();
      onClose?.();
      return false;
    }
  }
  return true;
}

export async function openNativeQRScanner({ onScan, onClose, onPermissionDenied, onModuleInstalling }: NativeQRScannerProps) {
  try {
    const hasPermission = await checkCameraPermission(onPermissionDenied, onClose);
    if (!hasPermission) return;

    if (isAndroid) {
      // Android: Google Code Scanner (UI nativa do Google Play Services)
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        onModuleInstalling?.();
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        onClose();
        return;
      }

      const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
      const raw = barcodes[0]?.rawValue;
      if (barcodes.length > 0 && raw) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        onScan(raw);
      } else {
        onClose();
      }
    } else {
      // iOS: startScan() — câmera nativa por trás do WebView transparente
      document.body.classList.add('qr-scan-active');

      await BarcodeScanner.addListener('barcodesScanned', async (result) => {
        const raw = result.barcodes[0]?.rawValue;
        if (raw) {
          await BarcodeScanner.removeAllListeners();
          await BarcodeScanner.stopScan();
          document.body.classList.remove('qr-scan-active');
          await Haptics.impact({ style: ImpactStyle.Medium });
          onScan(raw);
        }
      });

      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    }
  } catch {
    document.body.classList.remove('qr-scan-active');
    await BarcodeScanner.removeAllListeners().catch(() => {});
    onClose();
  }
}

export async function stopNativeScanner() {
  document.body.classList.remove('qr-scan-active');
  await BarcodeScanner.removeAllListeners().catch(() => {});
  await BarcodeScanner.stopScan().catch(() => {});
}
