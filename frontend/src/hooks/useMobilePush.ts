import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { isNative } from '../utils/platform';

export function useMobilePush() {
  const { user } = useAuthStore();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isNative || !user || registeredRef.current) return;

    const setup = async () => {
      try {
        const { receive } = await PushNotifications.checkPermissions();

        let permission = receive;
        if (permission === 'prompt') {
          const result = await PushNotifications.requestPermissions();
          permission = result.receive;
        }

        if (permission !== 'granted') return;

        // Listeners devem ser adicionados ANTES de register() para evitar race condition
        PushNotifications.addListener('registration', async (token) => {
          try {
            await api.post('/push/register-device', { fcmToken: token.value });
            registeredRef.current = true;
          } catch (err) {
            console.error('[PUSH] Falha ao registrar token FCM:', err);
          }
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('[PUSH] Erro de registro:', err);
        });

        await PushNotifications.register();
      } catch (err) {
        console.error('[PUSH] Erro no setup:', err);
      }
    };

    setup();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
}
