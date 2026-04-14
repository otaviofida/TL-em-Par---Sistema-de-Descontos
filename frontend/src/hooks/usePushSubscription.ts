import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export function usePushSubscription() {
  const { user } = useAuthStore();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user || subscribedRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const subscribe = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.ready;

        // Busca a chave pública VAPID do backend
        const { data: vapidRes } = await api.get<{ success: boolean; data: { publicKey: string } }>('/push/vapid-key');
        const vapidPublicKey = vapidRes.data.publicKey;
        if (!vapidPublicKey) return;

        // Verifica se já tem subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        // Envia para o backend
        await api.post('/push/subscribe', { subscription: subscription.toJSON() });
        subscribedRef.current = true;
      } catch (err) {
        console.error('[PUSH] Erro ao se inscrever:', err);
      }
    };

    subscribe();
  }, [user]);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
