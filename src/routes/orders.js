const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;