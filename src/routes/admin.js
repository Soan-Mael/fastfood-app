const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  getRevenueStats,
} = require('../controllers/adminController');
const {
  getAllOrders,
  updateOrderStatus,
  getPendingDeliveries,
} = require('../controllers/orderController');
const {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
  createRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/pending', getPendingDeliveries);
router.put('/orders/:id/status', updateOrderStatus);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Revenue Statistics (NOUVEAU)
router.get('/revenue/stats', getRevenueStats);

// Restaurants
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id', getRestaurantById);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.post('/restaurants', createRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

module.exports = router;