// src/pages/OrdersPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/order-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Package, Bike, CheckCircle, XCircle, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/api';

type OrderStatus = 'confirmed' | 'preparing' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';

// Конфигурация статусов на русском
const statusLabels: Record<OrderStatus, string> = {
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  picked_up: 'Забран',
  on_the_way: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const statusColors: Record<OrderStatus, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  picked_up: 'bg-purple-100 text-purple-700',
  on_the_way: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, fetchOrders, updateLocalOrderStatus, isLoading } = useOrderStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'delivered' | 'cancelled'>('in-progress');
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Charger les commandes au montage
  useEffect(() => {
    loadOrders();
  }, []);

  // Écouter les mises à jour en temps réel via WebSocket
  useEffect(() => {
    const handleStatusUpdate = (event: any) => {
      const { orderId, status, orderNumber } = event.detail;
      console.log(' Mise à jour commande reçue:', { orderId, status, orderNumber });
      
      // Mettre à jour localement
      updateLocalOrderStatus(orderId, status);
      
      // Afficher une notification
      toast({
        title: "Обновление статуса заказа",
        description: `Заказ #${orderNumber || orderId.slice(-5)} ${getStatusLabel(status)}`,
      });
    };

    window.addEventListener('client-order-status-updated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('client-order-status-updated', handleStatusUpdate);
    };
  }, []);

  const loadOrders = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return statusLabels[status] || status;
  };

  // Fonction pour annuler une commande
  const cancelOrder = async (orderId: string) => {
    if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
      setCancellingOrderId(orderId);
      try {
        await orderService.cancelOrder(orderId);
        toast({
          title: "Заказ отменён",
          description: "Ваш заказ был успешно отменён",
        });
        // Recharger les commandes
        await loadOrders();
      } catch (error: any) {
        console.error('Erreur annulation:', error);
        toast({
          title: "Ошибка",
          description: error.response?.data?.message || "Не удалось отменить заказ",
          variant: "destructive",
        });
      } finally {
        setCancellingOrderId(null);
      }
    }
  };

  // Фильтрация заказов по вкладке
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'in-progress') {
      return orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
    }
    if (activeTab === 'delivered') {
      return orders.filter(order => order.status === 'delivered');
    }
    if (activeTab === 'cancelled') {
      return orders.filter(order => order.status === 'cancelled');
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  // Форматирование даты
  const formatDate = (date: Date | string) => {
    if (!date) return 'Дата неизвестна';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Подсчёт заказов по статусам
  const inProgressCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  const getProgressWidth = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return 10;
      case 'preparing': return 25;
      case 'picked_up': return 50;
      case 'on_the_way': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">История заказов</h1>
          <p className="text-gray-500 mt-1">
            Просматривайте и отслеживайте все ваши текущие и прошлые заказы
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadOrders}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Все заказы
        </button>
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'in-progress'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          В процессе
          {inProgressCount > 0 && (
            <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
              {inProgressCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'delivered'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Доставлены
          {deliveredCount > 0 && (
            <span className="ml-1 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
              {deliveredCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'cancelled'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Отменены
          {cancelledCount > 0 && (
            <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {cancelledCount}
            </span>
          )}
        </button>
      </div>

      {/* Список заказов */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Заказы не найдены</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'in-progress' 
                  ? "У вас нет заказов в процессе"
                  : activeTab === 'delivered'
                  ? "У вас ещё нет доставленных заказов"
                  : activeTab === 'cancelled'
                  ? "У вас нет отменённых заказов"
                  : "Вы ещё не сделали ни одного заказа"}
              </p>
              <Button onClick={() => navigate('/')}>
                Заказать сейчас
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Левая часть - Информация о заказе */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{order.restaurantName || 'Ресторан'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      {order.status === 'delivered' && (
                        <span className="text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Доставлен
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bike className="h-3 w-3" />
                        <span>Ориентировочная доставка: {order.estimatedDelivery || '20:00'}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-mono text-gray-400">
                          Заказ #{order.orderNumber || order.id?.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Правая часть - Цена и кнопки */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} товаров
                      </div>
                      <div className="text-xl font-bold">
                        {order.total?.toFixed(2) || '0'} ₽
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/tracking/${order.id}`)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Подробнее
                      </Button>
                      
                      {/* Bouton Annuler - visible seulement si commande non livrée et non annulée */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="gap-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                        >
                          {cancellingOrderId === order.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Отменить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Прогресс-бар для заказов в процессе */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs mb-2">
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
                      <span className="text-gray-400">Доставлен</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                        style={{ width: `${getProgressWidth(order.status)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Бейдж Доставлен */}
                {order.status === 'delivered' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>✅ Заказ успешно доставлен! Приятного аппетита!</span>
                    </div>
                  </div>
                )}

                {/* Бейдж Отменён */}
                {order.status === 'cancelled' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>❌ Заказ отменён</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}