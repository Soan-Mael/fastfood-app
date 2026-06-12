// src/services/socket.js
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';

let socket = null;

export const initializeSocket = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated || !user) {
    console.log('Socket non initialisé: utilisateur non connecté');
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
    console.log('🔌 Socket connecté');
    socket.emit('identify', user._id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket déconnecté');
  });

  socket.on('new-order', (data) => {
    console.log('🛍️ Nouvelle commande reçue:', data);
    // Dispatch un événement personnalisé pour le frontend
    window.dispatchEvent(new CustomEvent('new-order', { detail: data }));
  });

  socket.on('order-status-updated', (data) => {
    console.log('🚚 Statut mis à jour:', data);
    window.dispatchEvent(new CustomEvent('order-status-updated', { detail: data }));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;