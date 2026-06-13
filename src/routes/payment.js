// backend/src/routes/payment.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { createPaymentIntent, getPaymentIntent } = require('../services/stripeService');

const router = express.Router();

// Créer un PaymentIntent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    const result = await createPaymentIntent(amount, currency, metadata);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer un PaymentIntent
router.get('/payment-intent/:id', protect, async (req, res) => {
  try {
    const paymentIntent = await getPaymentIntent(req.params.id);
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;