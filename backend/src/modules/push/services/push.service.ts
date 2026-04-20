import { webPush } from '../../../config/webpush.js';
import { messaging } from '../../../config/firebase.js';
import { PushSubscriptionRepository } from '../repositories/push.repository.js';
import { env } from '../../../config/env.js';

const PUSH_OPTIONS = { timeout: 30000 };
const MAX_RETRIES = 3;

export class PushService {
  constructor(private pushRepo = new PushSubscriptionRepository()) {}

  getVapidPublicKey() {
    return env.VAPID_PUBLIC_KEY;
  }

  private async sendWebWithRetry(
    sub: { endpoint: string; keys: { p256dh: string; auth: string } },
    body: string,
  ): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await webPush.sendNotification(sub, body, PUSH_OPTIONS);
        return;
      } catch (err: any) {
        const isNetwork = ['ETIMEDOUT', 'ENETUNREACH', 'ECONNRESET'].includes(err.code);
        if (isNetwork && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }
  }

  private async sendFcm(
    fcmToken: string,
    payload: { title: string; message: string; url?: string },
  ): Promise<void> {
    if (!messaging) {
      console.warn('[PUSH] Firebase não configurado — pulando envio FCM');
      return;
    }
    await messaging.send({
      token: fcmToken,
      notification: { title: payload.title, body: payload.message },
      data: payload.url ? { url: payload.url } : undefined,
    });
  }

  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.pushRepo.upsertWeb({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });
  }

  async registerDevice(userId: string, fcmToken: string, platform: 'android' | 'ios') {
    return this.pushRepo.upsertDevice({ userId, fcmToken, platform });
  }

  async unsubscribe(endpoint: string) {
    return this.pushRepo.deleteByEndpoint(endpoint);
  }

  async sendToUser(userId: string, payload: { title: string; message: string; url?: string }) {
    const subscriptions = await this.pushRepo.findByUserId(userId);
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        if (sub.fcmToken) {
          await this.sendFcm(sub.fcmToken, payload);
        } else if (sub.endpoint && sub.p256dh && sub.auth) {
          await this.sendWebWithRetry(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload),
          );
        }
        sent++;
      } catch (err: any) {
        console.error(`[PUSH] Falha para userId ${userId}:`, err.code || err.statusCode || err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await this.pushRepo.deleteById(sub.id);
        }
        failed++;
      }
    }

    return { sent, failed };
  }

  async sendToAll(payload: { title: string; message: string; url?: string }) {
    const subscriptions = await this.pushRepo.findAll();
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        if (sub.fcmToken) {
          await this.sendFcm(sub.fcmToken, payload);
        } else if (sub.endpoint && sub.p256dh && sub.auth) {
          await this.sendWebWithRetry(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload),
          );
        }
        sent++;
      } catch (err: any) {
        console.error(`[PUSH] Falha geral:`, err.code || err.statusCode || err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await this.pushRepo.deleteById(sub.id);
        }
        failed++;
      }
    }

    return { sent, failed };
  }

  async getSubscriberCount() {
    return this.pushRepo.countAll();
  }
}
