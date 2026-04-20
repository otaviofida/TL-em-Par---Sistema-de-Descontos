import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface NativeQRScannerProps {
  onScan: (token: string) => void;
  onClose: () => void;
}

// Abre o scanner nativo ML Kit e retorna o resultado via onScan.
// Usa scan() — UI nativa pronta, sem overlay WebView customizado.
export async function openNativeQRScanner({ onScan, onClose }: NativeQRScannerProps) {
  try {
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
  } catch (err: any) {
    // Usuário cancelou ou erro de câmera
    onClose();
  }
}
