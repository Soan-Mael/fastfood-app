const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation, sendStatusUpdateEmail } = require('../services/emailService');

// Create order
const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id,
      userName: req.user.name,
      userPhone: req.user.phone,
    };

    const order = await Order.create(orderData);

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalOrders: 1, totalSpent: order.total }
    });

    // Récupérer l'email de l'utilisateur
    const user = await User.findById(req.user.id);
    const orderWithEmail = {
      ...order.toObject(),
      userEmail: user.email,
    };

    // Envoi de l'email de confirmation
    await sendOrderConfirmation(orderWithEmail);

    // Emit socket event pour admin et client
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', {
        id: order._id,
        orderNumber: order.orderNumber,
        restaurantName: order.restaurantName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.userId,
      });
      
      // Notifier spécifiquement le client
      io.to(`user-${order.userId}`).emit('new-order', {
        id: order._id,
        orderNumber: order.orderNumber,
        restaurantName: order.restaurantName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order status only (pour suivi rapide)
const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('status orderNumber estimatedDelivery');
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin) - MODIFIÉ pour envoyer userId et email
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Récupérer l'ancien statut avant mise à jour
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    const oldStatus = oldOrder.status;
    
    // Vérifier si le nouveau statut est valide
    const validStatuses = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    // Vérifier qu'on ne peut pas revenir en arrière
    const statusOrder = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered'];
    const oldIndex = statusOrder.indexOf(oldStatus);
    const newIndex = statusOrder.indexOf(status);
    
    if (oldIndex > newIndex && oldStatus !== 'cancelled') {
      return res.status(400).json({ message: 'Impossible de revenir à un statut antérieur' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Envoyer un email si le statut a changé
    if (oldStatus !== status) {
      try {
        const user = await User.findById(order.userId);
        const orderWithEmail = {
          ...order.toObject(),
          userEmail: user.email,
        };
        
        await sendStatusUpdateEmail(orderWithEmail, oldStatus, status);
        console.log(`📧 Email envoyé pour la commande #${order.orderNumber}`);
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
      }
    }

    // Emit socket event pour admin ET client
    const io = req.app.get('io');
    if (io) {
      const eventData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        userId: order.userId,
        oldStatus: oldStatus,
        estimatedDelivery: order.estimatedDelivery,
        timestamp: new Date(),
      };
      
      // Envoyer à l'admin
      io.emit('order-status-updated', eventData);
      
      // Envoyer spécifiquement au client
      io.to(`user-${order.userId}`).emit('order-status-updated', eventData);
      
      console.log(`📢 Statut mis à jour: #${order.orderNumber} -> ${order.status} (client: ${order.userId})`);
    }

    res.json(order);
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update estimated delivery time
const updateEstimatedDelivery = async (req, res) => {
  try {
    const { estimatedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { estimatedDelivery },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('delivery-time-updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        estimatedDelivery: order.estimatedDelivery,
      });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort('-createdAt').populate('userId', 'name phone email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending deliveries
const getPendingDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'picked_up', 'on_the_way'] }
    }).sort('createdAt').populate('userId', 'name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by status (admin)
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    const orders = await Order.find({ status }).sort('-createdAt').populate('userId', 'name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order (client)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    // Vérifier que la commande appartient à l'utilisateur
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    // Vérifier que la commande peut être annulée (seulement si non livrée)
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Impossible d\'annuler une commande déjà livrée' });
    }
    
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cette commande est déjà annulée' });
    }
    
    // Vérifier qu'on peut annuler seulement avant "picked_up"
    if (order.status === 'picked_up' || order.status === 'on_the_way') {
      return res.status(400).json({ message: 'Impossible d\'annuler une commande déjà en cours de livraison' });
    }
    
    const oldStatus = order.status;
    order.status = 'cancelled';
    await order.save();
    
    // Envoyer un email d'annulation
    try {
      const user = await User.findById(order.userId);
      const orderWithEmail = {
        ...order.toObject(),
        userEmail: user.email,
      };
      await sendStatusUpdateEmail(orderWithEmail, oldStatus, 'cancelled');
    } catch (emailError) {
      console.error('Erreur envoi email annulation:', emailError);
    }
    
    // Émettre l'événement socket
    const io = req.app.get('io');
    if (io) {
      const eventData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        userId: order.userId,
        oldStatus: oldStatus,
      };
      io.emit('order-status-updated', eventData);
      io.to(`user-${order.userId}`).emit('order-status-updated', eventData);
    }
    
    res.json({ message: 'Commande annulée avec succès', order });
  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderStatus,
  updateOrderStatus,
  updateEstimatedDelivery,
  getAllOrders,
  getPendingDeliveries,
  getOrdersByStatus,
  cancelOrder,
};