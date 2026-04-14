import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { sendSuccess } from '../../../shared/helpers/response.js';
import { stripe } from '../../../config/stripe.js';
import { env } from '../../../config/env.js';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.createCheckoutSession(req.userId!, req.body.priceId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.getStatus(req.userId!);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.cancelSubscription(req.userId!, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async verifySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      const result = await subscriptionService.verifyCheckoutSession(req.userId!, sessionId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['stripe-signature'] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return res.status(400).json({ error: 'Webhook signature verification failed.' });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await subscriptionService.handleCheckoutCompleted(event.data.object as any);
          break;
        case 'invoice.paid':
          await subscriptionService.handleInvoicePaid(event.data.object as any);
          break;
        case 'invoice.payment_failed':
          await subscriptionService.handleInvoicePaymentFailed(event.data.object as any);
          break;
        case 'customer.subscription.deleted':
          await subscriptionService.handleSubscriptionDeleted(event.data.object as any);
          break;
      }

      return res.json({ received: true });
    } catch (err) {
      console.error('[WEBHOOK ERROR]', err);
      return res.status(500).json({ error: 'Webhook handler failed.' });
    }
  }
}
