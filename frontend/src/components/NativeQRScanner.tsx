import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface NativeQRScannerProps {
  onScan: (token: string) => void;
  onClose: () => void;
  onPermissionDenied?: () => void;
  onModuleInstalling?: () => void;
}

export async function openNativeQRScanner({ onScan, onClose, onPermissionDenied, onModuleInstalling }: NativeQRScannerProps) {
  try {
    // 1. Verifica permissão de câmera
    const { camera } = await BarcodeScanner.checkPermissions();

    if (camera === 'denied') {
      onPermissionDenied?.();
      onClose();
      return;
    }

    if (camera !== 'granted') {
      const { camera: granted } = await BarcodeScanner.requestPermissions();
      if (granted !== 'granted') {
        onPermissionDenied?.();
        onClose();
        return;
      }
    }

    // 2. Verifica se o módulo ML Kit está instalado no Google Play Services
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) {
      onModuleInstalling?.();
      await BarcodeScanner.installGoogleBarcodeScannerModule();
      // Módulo instalado em background — usuário precisa tentar novamente
      onClose();
      return;
    }

    // 3. Abre o scanner nativo
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode],
    });

    const raw = barcodes[0]?.rawValue;
    if (barcodes.length > 0 && raw) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      onScan(raw);
    } else {
      onClose();
    }
  } catch {
    onClose();
  }
}
