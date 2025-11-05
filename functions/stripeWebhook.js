import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const billingCycle = session.metadata.billing_cycle;

        if (userId) {
          await base44.asServiceRole.auth.updateUser(userId, {
            subscription_tier: 'pro',
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            billing_cycle: billingCycle,
            stripe_customer_id: session.customer,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by customer ID
        const users = await base44.asServiceRole.entities.User.filter({
          stripe_customer_id: customerId,
        });

        if (users.length > 0) {
          const user = users[0];
          let status = 'active';

          if (subscription.status === 'past_due') {
            status = 'past_due';
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'cancelled';
          }

          await base44.asServiceRole.auth.updateUser(user.id, {
            subscription_status: status,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const users = await base44.asServiceRole.entities.User.filter({
          stripe_customer_id: customerId,
        });

        if (users.length > 0) {
          const user = users[0];
          await base44.asServiceRole.auth.updateUser(user.id, {
            subscription_tier: 'free',
            subscription_status: 'cancelled',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const users = await base44.asServiceRole.entities.User.filter({
          stripe_customer_id: customerId,
        });

        if (users.length > 0) {
          const user = users[0];
          await base44.asServiceRole.auth.updateUser(user.id, {
            subscription_status: 'past_due',
          });

          // Send email notification
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Payment Failed - Action Required',
            body: `Hi ${user.full_name},\n\nYour recent payment for SoloSync Pro failed. Please update your payment method to continue enjoying premium features.\n\nUpdate your payment method: ${req.headers.get('origin')}/settings\n\nBest regards,\nThe SoloSync Team`,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const users = await base44.asServiceRole.entities.User.filter({
          stripe_customer_id: customerId,
        });

        if (users.length > 0) {
          const user = users[0];
          await base44.asServiceRole.auth.updateUser(user.id, {
            subscription_status: 'active',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});