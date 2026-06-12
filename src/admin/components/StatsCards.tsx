// src/admin/components/StatsCards.tsx
import { ShoppingBag, DollarSign, Users, Store } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalRestaurants: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Commandes",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "Revenus",
      value: `${stats.totalRevenue.toLocaleString()} ₽`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Restaurants",
      value: stats.totalRestaurants,
      icon: Store,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}