const User = require('../models/User');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Nouveau client connecté:', socket.id);

    // Client s'identifie
    socket.on('identify', async (userId) => {
      socket.userId = userId;
      try {
        const user = await User.findById(userId);
        if (user && user.role === 'admin') {
          socket.join('admin-room');
          console.log('👑 Admin connecté à la room admin');
        } else if (user) {
          socket.join(`user-${userId}`);
          console.log(`👤 Utilisateur ${user.name} connecté à sa room personnelle`);
        }
      } catch (error) {
        console.error('Erreur identification:', error);
      }
    });

    // Nouvel utilisateur inscrit
    socket.on('new-user', (userData) => {
      io.to('admin-room').emit('new-user', userData);
      console.log('📝 Nouvel utilisateur:', userData.name);
    });

    // Nouvelle commande
    socket.on('new-order', (orderData) => {
      io.to('admin-room').emit('new-order', orderData);
      console.log('🛍️ Nouvelle commande:', orderData.orderNumber);
    });

    // Mise à jour de statut - Envoyer à l'admin ET au client
    socket.on('order-status-updated', (data) => {
      // Envoyer à l'admin
      io.to('admin-room').emit('order-status-updated', data);
      console.log('🚚 Statut mis à jour (admin):', data.orderNumber, '->', data.status);
      
      // Envoyer au client concerné (si userId est présent)
      if (data.userId) {
        io.to(`user-${data.userId}`).emit('order-status-updated', data);
        console.log(`📱 Notification envoyée au client ${data.userId}: ${data.status}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client déconnecté:', socket.id);
    });
  });
};

module.exports = socketHandler;