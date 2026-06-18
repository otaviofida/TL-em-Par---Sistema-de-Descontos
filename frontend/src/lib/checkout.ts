import { api } from './api';
import { Browser } from '@capacitor/browser';
import { isNative } from '../utils/platform';

export async function startCheckout() {
  const { data } = await api.post<{ success: boolean; data: { checkoutUrl: string; sessionId: string } }>(
    '/subscriptions/checkout',
    { platform: isNative ? 'native' : 'web' }
  );
  const { checkoutUrl, sessionId } = data.data;

  if (isNative) {
    // Fallback: se o deep link não disparar (raro), o browserFinished navega manualmente.
    // Verifica pathname para não duplicar caso o appUrlOpen já tenha navegado.
    const listener = await Browser.addListener('browserFinished', () => {
      listener.remove();
      if (!window.location.pathname.includes('/assinatura/sucesso')) {
        window.location.href = `/assinatura/sucesso?session_id=${sessionId}`;
      }
    });
    await Browser.open({ url: checkoutUrl });
  } else {
    window.location.href = checkoutUrl;
  }
}
