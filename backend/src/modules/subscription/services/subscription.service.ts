import { stripe } from '../../../config/stripe.js';
import { env } from '../../../config/env.js';
import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { AuthRepository } from '../../auth/repositories/auth.repository.js';
import { NotFoundError, AppError } from '../../../shared/errors/index.js';
import { sendEmail, subscriptionExpiringEmailHtml } from '../../../config/email.js';
import { CancelWithFeedbackInput } from '../schemas/subscription.schema.js';
import Stripe from 'stripe';

function getSubscriptionPeriod(sub: any) {
  const item = sub.items?.data?.[0];
  const start = item?.current_period_start ?? sub.current_period_start;
  const end = item?.current_period_end ?? sub.current_period_end;
  return {
    currentPeriodStart: start ? new Date(start * 1000) : new Date(),
    currentPeriodEnd: end ? new Date(end * 1000) : new Date(),
  };
}

export class SubscriptionService {
  constructor(
    private subscriptionRepo = new SubscriptionRepository(),
    private authRepo = new AuthRepository(),
  ) {}

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    // Verificar se já tem assinatura ativa (RN-ASS-05)
    const existingSub = await this.subscriptionRepo.findByUserId(userId);
    if (existingSub?.status === 'ACTIVE') {
      throw new AppError('Você já possui uma assinatura ativa.', 409, 'SUBSCRIPTION_ALREADY_ACTIVE');
    }

    // Verificar se já tem customer no Stripe
    let customerId: string | undefined;
    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: env.STRIPE_CANCEL_URL,
      client_reference_id: userId,
      metadata: { userId },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { checkoutUrl: session.url };
  }

  async getStatus(userId: string) {
    const subscription = await this.subscriptionRepo.findByUserId(userId);
    if (!subscription) {
      return { status: null, message: 'Nenhuma assinatura encontrada.' };
    }

    return {
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  async cancelSubscription(userId: string, feedback?: CancelWithFeedbackInput) {
    const subscription = await this.subscriptionRepo.findByUserId(userId);
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundError('Nenhuma assinatura ativa para cancelar.');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.subscriptionRepo.upsert(userId, {
      status: subscription.status,
      cancelAtPeriodEnd: true,
    });

    // Salvar feedback de cancelamento
    if (feedback) {
      await this.subscriptionRepo.createCancellationFeedback({
        userId,
        reason: feedback.reason,
        rating: feedback.rating,
        improvement: feedback.improvement,
        wouldReturn: feedback.wouldReturn,
      });
    }

    // Notificar usuário que a assinatura será cancelada
    const user = await this.authRepo.findUserById(userId);
    if (user && subscription.currentPeriodEnd) {
      const expirationDate = subscription.currentPeriodEnd.toLocaleDateString('pt-BR');
      sendEmail({
        to: user.email,
        subject: 'Sua assinatura será cancelada — TL EM PAR',
        html: subscriptionExpiringEmailHtml(user.name, expirationDate, `${env.FRONTEND_URL}/assinatura`),
      }).catch(err => console.error('[SUBSCRIPTION] Erro ao enviar email de cancelamento:', err));
    }

    return {
      status: subscription.status,
      cancelAtPeriodEnd: true,
    };
  }

  async verifyCheckoutSession(userId: string, sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.client_reference_id !== userId && session.metadata?.userId !== userId) {
      throw new AppError('Sessão não pertence a este usuário.', 403, 'FORBIDDEN');
    }

    if (session.payment_status !== 'paid') {
      return { status: 'INCOMPLETE', message: 'Pagamento ainda não confirmado.' };
    }

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const period = getSubscriptionPeriod(stripeSubscription);

    await this.subscriptionRepo.upsert(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
      ...period,
      cancelAtPeriodEnd: false,
    });

    return { status: 'ACTIVE', message: 'Assinatura ativada com sucesso.' };
  }

  // --- Webhook handlers ---

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    if (!userId) return;

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const period = getSubscriptionPeriod(stripeSubscription);

    await this.subscriptionRepo.upsert(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
      ...period,
      cancelAtPeriodEnd: false,
    });
  }

  async handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const period = getSubscriptionPeriod(stripeSubscription);

    try {
      await this.subscriptionRepo.updateByStripeSubscriptionId(subscriptionId, {
        status: 'ACTIVE',
        ...period,
      });
    } catch (error) {
      console.warn(`[WEBHOOK] invoice.paid — subscription ${subscriptionId} not found yet (may arrive before checkout.completed):`, error);
    }
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    try {
      await this.subscriptionRepo.updateByStripeSubscriptionId(subscriptionId, {
        status: 'PAST_DUE',
      });
    } catch (error) {
      console.error(`[WEBHOOK] invoice.payment_failed — failed to update subscription ${subscriptionId}:`, error);
    }
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      await this.subscriptionRepo.updateByStripeSubscriptionId(subscription.id, {
        status: 'CANCELED',
        cancelAtPeriodEnd: false,
      });
    } catch (error) {
      console.error(`[WEBHOOK] customer.subscription.deleted — failed to cancel subscription ${subscription.id}:`, error);
    }
  }
}
