// backend/src/services/stripeService.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Créer un PaymentIntent
const createPaymentIntent = async (amount, currency = 'rub', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error('Erreur Stripe:', error);
    throw error;
  }
};

// Récupérer un PaymentIntent
const getPaymentIntent = async (paymentIntentId) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Erreur Stripe:', error);
    throw error;
  }
};

// Remboursement
const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    console.error('Erreur remboursement:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentIntent,
  refundPayment,
};