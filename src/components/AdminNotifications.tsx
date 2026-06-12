// src/components/AdminNotifications.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Bell, ShoppingBag, UserPlus, Truck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'new-order' | 'new-user' | 'status-update';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

export function AdminNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    // Écouter les événements WebSocket
    const handleNewOrder = (event: any) => {
      const order = event.detail;
      addNotification({
        type: 'new-order',
        title: '🛍️ Nouvelle commande',
        message: `${order.restaurantName} - ${order.total} ₽`,
        data: order,
      });
    };

    const handleStatusUpdate = (event: any) => {
      const data = event.detail;
      addNotification({
        type: 'status-update',
        title: '🚚 Mise à jour statut',
        message: `Commande #${data.orderNumber} : ${data.status}`,
        data: data,
      });
    };

    window.addEventListener('new-order', handleNewOrder);
    window.addEventListener('order-status-updated', handleStatusUpdate);

    return () => {
      window.removeEventListener('new-order', handleNewOrder);
      window.removeEventListener('order-status-updated', handleStatusUpdate);
    };
  }, [isAuthenticated, user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    
    // Son optionnel
    // const audio = new Audio('/notification.mp3');
    // audio.play();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    if (notification.type === 'new-order') {
      navigate('/admin/orders');
    } else if (notification.type === 'status-update') {
      navigate('/admin/deliveries');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-orange-500 hover:underline">
                Tout marquer comme lu
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-orange-50' : ''
                  }`}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}