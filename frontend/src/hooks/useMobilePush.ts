import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { isNative, platform } from '../utils/platform';

export function useMobilePush() {
  const { user } = useAuthStore();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isNative || !user || registeredRef.current) return;

    const setup = async () => {
      try {
        // Dynamic import: só carrega o módulo Firebase em contexto nativo
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

        let { receive } = await FirebaseMessaging.checkPermissions();

        if (receive === 'prompt') {
          const result = await FirebaseMessaging.requestPermissions();
          receive = result.receive;
        }

        if (receive !== 'granted') return;

        FirebaseMessaging.addListener('tokenReceived', async ({ token }) => {
          try {
            await api.post('/push/register-device', { fcmToken: token, platform });
            registeredRef.current = true;
          } catch (err) {
            console.error('[PUSH] Falha ao registrar token FCM:', err);
          }
        });

        try {
          const { token } = await FirebaseMessaging.getToken();
          if (token) {
            await api.post('/push/register-device', { fcmToken: token, platform });
            registeredRef.current = true;
          }
        } catch (tokenErr: any) {
          // On iOS, APNs token may not be ready yet — tokenReceived listener handles it
          if (!tokenErr?.errorMessage?.includes('No APNs token')) {
            console.error('[PUSH] Erro ao obter token FCM:', tokenErr);
          }
        }
      } catch (err) {
        console.error('[PUSH] Erro no setup:', err);
      }
    };

    setup();

    return () => {
      import('@capacitor-firebase/messaging').then(({ FirebaseMessaging }) => {
        FirebaseMessaging.removeAllListeners();
      });
    };
  }, [user]);
}
