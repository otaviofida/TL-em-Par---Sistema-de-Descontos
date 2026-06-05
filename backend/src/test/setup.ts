/**
 * Executado antes de cada arquivo de teste.
 * Mocks de serviços externos e limpeza do banco de dados.
 */
import { vi, beforeAll, afterAll } from 'vitest';

// Mock do Stripe — evita chamadas reais à API
vi.mock('../config/stripe.js', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_fake_session',
          url: 'https://checkout.stripe.com/pay/cs_test_fake_session',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cs_test_fake_session',
          payment_status: 'paid',
          subscription: 'sub_test_fake',
          customer: 'cus_test_fake',
          client_reference_id: null,
          metadata: {},
        }),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_test_fake',
        status: 'active',
        items: {
          data: [{
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          }],
        },
        cancel_at_period_end: false,
      }),
      update: vi.fn().mockResolvedValue({ id: 'sub_test_fake', cancel_at_period_end: true }),
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/portal/fake' }),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

// Mock de email — evita envio real
vi.mock('../config/email.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'email_test_fake' }),
  welcomeEmailHtml: vi.fn().mockReturnValue('<html>welcome</html>'),
  subscriptionExpiringEmailHtml: vi.fn().mockReturnValue('<html>expiring</html>'),
  paymentFailedEmailHtml: vi.fn().mockReturnValue('<html>failed</html>'),
  passwordResetEmailHtml: vi.fn().mockReturnValue('<html>reset</html>'),
  emailVerificationHtml: vi.fn().mockReturnValue('<html>verify</html>'),
  emailVerifiedPaymentHtml: vi.fn().mockReturnValue('<html>verified</html>'),
  reviewRequestEmailHtml: vi.fn().mockReturnValue('<html>review</html>'),
}));

// Mock do Firebase — evita conexão real
vi.mock('../config/firebase.js', () => ({
  messaging: null,
}));

// Mock do web-push — evita push real
vi.mock('../config/webpush.js', () => ({
  webPush: {
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

// ---- Utilitários de limpeza ----

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function cleanDb() {
  await pool.query(`
    TRUNCATE TABLE
      benefit_redemptions,
      cancellation_feedbacks,
      company_editions,
      company_schedules,
      editions,
      email_verification_tokens,
      marketing_pushes,
      notifications,
      password_reset_tokens,
      push_subscriptions,
      refresh_tokens,
      reviews,
      subscriptions,
      audit_logs,
      companies,
      users
    RESTART IDENTITY CASCADE
  `);
}

beforeAll(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await pool.end();
});
