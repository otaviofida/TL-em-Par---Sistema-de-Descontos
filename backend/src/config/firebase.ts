import admin from 'firebase-admin';
import { env } from './env.js';

let messaging: admin.messaging.Messaging | null = null;

if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = admin.messaging();
  } catch (err) {
    console.error('[Firebase] Falha ao inicializar Firebase Admin:', err);
  }
}

export { messaging };
