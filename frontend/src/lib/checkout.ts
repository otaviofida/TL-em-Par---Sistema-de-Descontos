import { api } from './api';
import { Browser } from '@capacitor/browser';
import { isNative } from '../utils/platform';

export async function startCheckout() {
  const { data } = await api.post<{ success: boolean; data: { checkoutUrl: string } }>(
    '/subscriptions/checkout',
    { priceId: import.meta.env.VITE_STRIPE_PRICE_ID }
  );
  const url = data.data.checkoutUrl;
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}
