// src/admin/pages/OrdersAdmin.tsx
import { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, RefreshCw, Clock, MapPin, User, Phone, Package, CheckCircle, Truck, Bike } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderNumber: string;
  restaurantName: string;
  total: number;
  status: string;
  address: string;
  userName: string;
  userPhone: string;
  items: any[];
  createdAt: string;
  estimatedDelivery: string;
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllOrders();
      console.log('Commandes reçues:', response.data);
      setOrders(response.data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast({
        title: "Succès",
        description: `Statut de la commande mis à jour : ${getStatusLabel(newStatus)}`,
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      picked_up: 'Prise en charge',
      on_the_way: 'En route',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: Record<string, string> = {
      confirmed: 'preparing',
      preparing: 'picked_up',
      picked_up: 'on_the_way',
      on_the_way: 'delivered',
    };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const next = getNextStatus(currentStatus);
    return next ? getStatusLabel(next) : null;
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return order.status !== 'delivered' && order.status !== 'cancelled';
    }
    if (activeTab === 'delivered') {
      return order.status === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  }).filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Управление заказами</h1>
          <p className="text-gray-500">Total: {orders.length} commandes</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par numéro, restaurant ou client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Все ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            в движении ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Доставка ({orders.filter(o => o.status === 'delivered').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Отменено ({orders.filter(o => o.status === 'cancelled').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {renderOrdersList(filteredOrders)}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4 mt-4">
          {renderOrdersList(filteredOrders)}
        </TabsContent>
        <TabsContent value="delivered" className="space-y-4 mt-4">
          {renderOrdersList(filteredOrders)}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4 mt-4">
          {renderOrdersList(filteredOrders)}
        </TabsContent>
      </Tabs>

      {/* Modal détails commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Детали заказа</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Число</p>
                    <p className="font-medium">{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ресторан</p>
                    <p className="font-medium">{selectedOrder.restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Клиент</p>
                    <p className="font-medium">{selectedOrder.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">{selectedOrder.userPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="font-medium">{selectedOrder.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Дата</p>
                    <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Статус</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Предметы</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b pb-2">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{item.price * item.quantity} ₽</span>
                      </div>
                    ))}
                    <div className="pt-2 font-bold flex justify-between">
                      <span>итог</span>
                      <span>{selectedOrder.total?.toFixed(2)} ₽</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && getNextStatus(selectedOrder.status) && (
                  <div className="border-t pt-4">
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => {
                        updateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status));
                        setSelectedOrder(null);
                      }}
                    >
                      {getNextStatus(selectedOrder.status) === 'delivered' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Bike className="h-4 w-4 mr-2" />
                      )}
                      проверки : {getNextStatusLabel(selectedOrder.status)}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  function renderOrdersList(ordersToRender: Order[]) {
    if (ordersToRender.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Заказ не найден</p>
          </CardContent>
        </Card>
      );
    }

    return ordersToRender.map((order) => (
      <Card key={order._id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="font-semibold text-lg">{order.restaurantName}</h3>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
                <span className="text-sm text-gray-400">
                  #{order.orderNumber || order._id.slice(-6)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{order.userName || 'Client'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{order.userPhone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{order.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Заказ: {formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Progress bar */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={order.status === 'confirmed' ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                      Подтвержденный
                    </span>
                    <span className={order.status === 'preparing' ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                      Подготовка
                    </span>
                    <span className={order.status === 'picked_up' ? 'text-purple-600 font-medium' : 'text-gray-400'}>
                      Поддерживать
                    </span>
                    <span className={order.status === 'on_the_way' ? 'text-indigo-600 font-medium' : 'text-gray-400'}>
                      В пути
                    </span>
                    <span className="text-gray-400">Доставленный</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                      style={{ width: `${getProgressWidth(order.status)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right section */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {order.items?.length || 0} статьи
                </div>
                <div className="text-xl font-bold">
                  {order.total?.toFixed(2)} ₽
                </div>
              </div>

              {order.status !== 'delivered' && order.status !== 'cancelled' && getNextStatus(order.status) && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {getNextStatus(order.status) === 'delivered' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  {getNextStatusLabel(order.status)}
                </Button>
              )}

              {order.status === 'delivered' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Доставленный
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(order)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Подробности
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }
}