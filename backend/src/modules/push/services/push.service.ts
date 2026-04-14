import { webPush } from '../../../config/webpush.js';
import { PushSubscriptionRepository } from '../repositories/push.repository.js';
import { env } from '../../../config/env.js';

const PUSH_OPTIONS = { timeout: 30000 };
const MAX_RETRIES = 3;

export class PushService {
  constructor(
    private pushRepo = new PushSubscriptionRepository(),
  ) {}

  getVapidPublicKey() {
    return env.VAPID_PUBLIC_KEY;
  }

  private async sendWithRetry(
    sub: { endpoint: string; keys: { p256dh: string; auth: string } },
    body: string,
  ): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await webPush.sendNotification(sub, body, PUSH_OPTIONS);
        return;
      } catch (err: any) {
        const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH' || err.code === 'ECONNRESET';
        if (isTimeout && attempt < MAX_RETRIES) {
          console.log(`[PUSH] Tentativa ${attempt}/${MAX_RETRIES} falhou (${err.code}), retentando...`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }
  }

  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.pushRepo.upsert({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });
  }

  async unsubscribe(endpoint: string) {
    return this.pushRepo.deleteByEndpoint(endpoint);
  }

  async sendToUser(userId: string, payload: { title: string; message: string; url?: string }) {
    const subscriptions = await this.pushRepo.findByUserId(userId);
    const body = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.sendWithRetry(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
      } catch (err: any) {
        console.error(`[PUSH] Falha definitiva para ${sub.endpoint.slice(0, 60)}:`, err.code || err.statusCode);
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
    const body = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.sendWithRetry(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
      } catch (err: any) {
        console.error(`[PUSH] Falha definitiva para ${sub.endpoint.slice(0, 60)}:`, err.code || err.statusCode);
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
