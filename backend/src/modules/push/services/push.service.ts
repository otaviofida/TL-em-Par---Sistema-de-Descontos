import { webPush } from '../../../config/webpush.js';
import { PushSubscriptionRepository } from '../repositories/push.repository.js';
import { env } from '../../../config/env.js';

export class PushService {
  constructor(
    private pushRepo = new PushSubscriptionRepository(),
  ) {}

  getVapidPublicKey() {
    return env.VAPID_PUBLIC_KEY;
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
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
      } catch (err: any) {
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
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
      } catch (err: any) {
        console.error(`[PUSH] Falha ao enviar para ${sub.endpoint.slice(0, 60)}...:`);
        console.error(`[PUSH] statusCode=${err.statusCode}, message=${err.message}, body=${err.body}`);
        console.error(`[PUSH] Full error:`, JSON.stringify(err, Object.getOwnPropertyNames(err)));
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
