import { api } from './api';

export async function startCheckout() {
  const { data } = await api.post<{ success: boolean; data: { checkoutUrl: string } }>(
    '/subscriptions/checkout',
    { priceId: import.meta.env.VITE_STRIPE_PRICE_ID }
  );
  window.location.href = data.data.checkoutUrl;
}
