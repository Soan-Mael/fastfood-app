const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingDeliveries = await Order.countDocuments({
      status: { $in: ['confirmed', 'preparing', 'picked_up', 'on_the_way'] }
    });
    const recentOrders = await Order.find({})
      .sort('-createdAt')
      .limit(10)
      .populate('userId', 'name');

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingDeliveries,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get revenue statistics by period
const getRevenueStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    let groupBy;
    let startDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 28);
        startDate.setHours(0, 0, 0, 0);
        groupBy = { $isoWeek: '$createdAt' };
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Formater les données selon la période
    let formattedData;
    
    if (period === 'week') {
      formattedData = stats.map((item, index) => ({
        period: `Semaine ${index + 1}`,
        revenue: item.revenue,
        orders: item.orders,
      }));
    } else if (period === 'month') {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      formattedData = stats.map(item => ({
        period: months[(item._id?.month || 1) - 1],
        revenue: item.revenue,
        orders: item.orders,
      }));
    } else {
      // Pour les jours, créer une période complète de 7 jours
      const daysMap = {};
      
      // Initialiser les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        daysMap[dateKey] = { revenue: 0, orders: 0, dayName };
      }
      
      // Remplir avec les données existantes
      stats.forEach(item => {
        if (item._id && item._id.year && item._id.month && item._id.day) {
          const dateKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
          if (daysMap[dateKey]) {
            daysMap[dateKey].revenue = item.revenue;
            daysMap[dateKey].orders = item.orders;
          }
        }
      });
      
      formattedData = Object.entries(daysMap).map(([date, data]) => ({
        period: data.dayName,
        revenue: data.revenue,
        orders: data.orders,
      }));
    }

    res.json(formattedData);
  } catch (error) {
    console.error('Erreur stats revenus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Exportation de toutes les fonctions
module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  getRevenueStats,
};