// src/pages/TrackingPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/order-store';
import { DeliveryMap } from '@/components/DeliveryMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Clock, Bike, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/api';

export default function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateLocalOrderStatus } = useOrderStore();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Écouter les mises à jour WebSocket en temps réel
  useEffect(() => {
    const handleStatusUpdate = (event: any) => {
      const { orderId: updatedOrderId, status, orderNumber } = event.detail;
      
      if (updatedOrderId === orderId) {
        console.log('📢 Mise à jour reçue:', { status, orderNumber });
        
        // Mettre à jour localement
        updateLocalOrderStatus(updatedOrderId, status);
        
        // Recharger la commande
        loadOrder();
        
        // Afficher une notification
        toast({
          title: "Статус заказа обновлён",
          description: `Заказ #${orderNumber || orderId.slice(-5)} → ${getStatusLabel(status)}`,
        });
        
        setLastUpdate(new Date());
      }
    };

    window.addEventListener('client-order-status-updated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('client-order-status-updated', handleStatusUpdate);
    };
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orderData = getOrderById(orderId!);
      if (orderData) {
        setOrder(orderData);
      } else {
        // Si non trouvé dans le store, aller chercher via API
        const response = await orderService.getOrderById(orderId!);
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      toast({
        title: "Ошибка",
        description: "Impossible de charger les détails de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Подтверждён',
      preparing: 'Готовится',
      picked_up: 'Забран',
      on_the_way: 'В пути',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      picked_up: 'bg-purple-100 text-purple-700',
      on_the_way: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'confirmed': return 15;
      case 'preparing': return 35;
      case 'picked_up': return 55;
      case 'on_the_way': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  // Coordonnées pour la carte
  const restaurantCoordinates = {
    'Пицца Итальяно': { lat: 52.6089, lng: 39.5996 },
    default: { lat: 52.6089, lng: 39.5996 },
  };

  const getRestaurantCoords = (name: string) => {
    return restaurantCoordinates[name as keyof typeof restaurantCoordinates] || restaurantCoordinates.default;
  };

  const deliveryCoords = { lat: 52.6200, lng: 39.6100 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Заказ не найден</h2>
        <Button onClick={() => navigate('/orders')}>
          Вернуться к заказам
        </Button>
      </div>
    );
  }

  const restaurantCoords = getRestaurantCoords(order.restaurantName);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/orders')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказам
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Отслеживание заказа</h1>
            <p className="text-gray-500">
              Заказ #{order.orderNumber || order.id.slice(-6)} • {order.restaurantName}
            </p>
          </div>

          {/* Statut actuel */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Текущий статус</p>
                <p className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Последнее обновление</p>
                <p>{lastUpdate.toLocaleTimeString('ru-RU')}</p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className={order.status === 'confirmed' ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                Подтверждён
              </span>
              <span className={order.status === 'preparing' ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                Готовится
              </span>
              <span className={order.status === 'picked_up' ? 'text-purple-600 font-medium' : 'text-gray-400'}>
                Забран
              </span>
              <span className={order.status === 'on_the_way' ? 'text-indigo-600 font-medium' : 'text-gray-400'}>
                В пути
              </span>
              <span className={order.status === 'delivered' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                Доставлен
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                style={{ width: `${getProgressWidth(order.status)}%` }}
              />
            </div>
          </div>

          {/* Carte */}
          <DeliveryMap
            restaurantLat={restaurantCoords.lat}
            restaurantLng={restaurantCoords.lng}
            deliveryLat={deliveryCoords.lat}
            deliveryLng={deliveryCoords.lng}
            status={order.status}
          />

          {/* Informations supplémentaires */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Заказ оформлен: {new Date(order.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-gray-400" />
              <span>Доставка: {order.estimatedDelivery || 'рассчитывается'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>Адрес: {order.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <span>Способ оплаты: {order.paymentMethod === 'card' ? 'Карта' : 'Наличные'}</span>
            </div>
          </div>

          {/* Bouton d'actualisation manuelle */}
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadOrder}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить вручную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}