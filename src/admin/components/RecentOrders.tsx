// src/admin/components/RecentOrders.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

export function RecentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Simulation de commandes récentes
    setOrders([
      { id: '1', restaurant: 'Pizza Italiano', total: 45.90, status: 'pending', date: '2024-01-15' },
      { id: '2', restaurant: 'Sushi Master', total: 32.50, status: 'delivered', date: '2024-01-15' },
      { id: '3', restaurant: 'Burger King', total: 28.90, status: 'preparing', date: '2024-01-14' },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      preparing: 'Préparation',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Commandes récentes</h3>
        <button
          onClick={() => navigate('/admin/orders')}
          className="text-orange-500 text-sm hover:underline"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{order.restaurant}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{order.date}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{order.total.toFixed(2)} ₽</span>
              <button
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}