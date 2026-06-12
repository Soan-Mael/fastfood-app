// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3004/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Order services
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),  // ← NOUVEAU
};

// Payment services
export const paymentService = {
  createPaymentIntent: (amount, currency = 'rub', metadata = {}) =>
    api.post('/payment/create-payment-intent', { amount, currency, metadata }),
  getPaymentIntent: (id) => api.get(`/payment/payment-intent/${id}`),
  refundPayment: (paymentIntentId, amount = null) =>
    api.post(`/payment/refund/${paymentIntentId}`, { amount }),
};

// Restaurant services (pour le frontend public)
export const restaurantService = {
  getAllRestaurants: () => api.get('/restaurants'),
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
};

// Admin services (nécessite rôle admin)
export const adminService = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Orders
  getAllOrders: () => api.get('/admin/orders'),
  getPendingDeliveries: () => api.get('/admin/orders/pending'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Revenue Statistics (NOUVEAU)
  getRevenueStats: (period = 'day') => api.get(`/admin/revenue/stats?period=${period}`),
  
  // Restaurants
  getAllRestaurants: () => api.get('/admin/restaurants'),
  getRestaurantById: (id) => api.get(`/admin/restaurants/${id}`),
  updateRestaurantStatus: (id, isActive) => api.put(`/admin/restaurants/${id}/status`, { isActive }),
  createRestaurant: (data) => api.post('/admin/restaurants', data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
};

export default api;