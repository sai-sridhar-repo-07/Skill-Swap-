const User = require('../models/User');
const { addCredits, TRANSACTION_TYPES } = require('../services/creditService');
const { logger } = require('../utils/logger');

// Lazy-load Stripe so the app starts fine even without the env var
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  // eslint-disable-next-line global-require
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const CREDIT_PACKS = {
  '10c':  { credits: 10,  price: 200  },   // $2.00
  '25c':  { credits: 25,  price: 400  },   // $4.00
  '50c':  { credits: 50,  price: 700  },   // $7.00
  '100c': { credits: 100, price: 1200 },   // $12.00
};

const createCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const { pack } = req.body;
    const selected = CREDIT_PACKS[pack];
    if (!selected) return res.status(400).json({ error: 'Invalid credit pack. Choose: 10c, 25c, 50c, 100c' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: selected.price,
          product_data: { name: `${selected.credits} SkillSwap Credits` },
        },
        quantity: 1,
      }],
      metadata: {
        userId: req.user._id.toString(),
        credits: selected.credits.toString(),
        type: 'credit_topup',
        pack,
      },
      success_url: `${process.env.CLIENT_URL}/dashboard?credits=success&pack=${pack}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?credits=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('createCheckoutSession error:', error.message);
    next(error);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!process.env.STRIPE_TEACHER_PRICE_ID) {
      return res.status(503).json({ error: 'Teacher subscriptions not yet configured' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{ price: process.env.STRIPE_TEACHER_PRICE_ID, quantity: 1 }],
      metadata: {
        userId: req.user._id.toString(),
        type: 'teacher_subscription',
      },
      success_url: `${process.env.CLIENT_URL}/dashboard?sub=success`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe-teacher?sub=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('createSubscription error:', error.message);
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const user = await User.findById(req.user._id).select('+stripeSubscriptionId');
    if (!user?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    await User.findByIdAndUpdate(req.user._id, {
      isTeacherSubscribed: false,
      stripeSubscriptionId: null,
      subscriptionExpiresAt: null,
    });
    res.json({ status: 'success', message: 'Subscription cancelled' });
  } catch (error) {
    logger.error('cancelSubscription error:', error.message);
    next(error);
  }
};

const handleWebhook = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.sendStatus(200);
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, type, credits } = session.metadata || {};

      if (type === 'credit_topup' && userId && credits) {
        await addCredits(
          userId,
          parseInt(credits),
          TRANSACTION_TYPES.STRIPE_TOPUP,
          null,
          `Stripe credit purchase: ${credits} credits`
        );
        logger.info(`Stripe topup: +${credits} credits for user ${userId}`);
      }

      if (type === 'teacher_subscription' && userId) {
        const subscriptionId = session.subscription;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        await User.findByIdAndUpdate(userId, {
          isTeacherSubscribed: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscriptionId,
          subscriptionExpiresAt: expiresAt,
        });
        logger.info(`Teacher subscription activated for user ${userId}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id }).select('+stripeSubscriptionId');
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          isTeacherSubscribed: false,
          stripeSubscriptionId: null,
          subscriptionExpiresAt: null,
        });
        logger.info(`Teacher subscription cancelled for user ${user._id}`);
      }
    }
  } catch (err) {
    logger.error('Webhook handler error:', err.message);
    // Still return 200 so Stripe doesn't retry
  }

  res.sendStatus(200);
};

module.exports = { createCheckoutSession, createSubscription, cancelSubscription, handleWebhook };
