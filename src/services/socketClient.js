// src/services/socketClient.js
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';

let socket = null;

export const initializeUserSocket = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated || !user) {
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io('http://localhost:3004', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

  socket.on('connect', () => {
    console.log('🔌 Socket client connecté');
    socket.emit('identify', user._id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket client déconnecté');
  });

  socket.on('order-status-updated', (data) => {
    console.log('📢 Mise à jour commande reçue:', data);
    // Déclencher un événement pour mettre à jour l'interface
    window.dispatchEvent(new CustomEvent('client-order-status-updated', { detail: data }));
  });

  return socket;
};

export const disconnectUserSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};