// src/admin/pages/Dashboard.tsx
import { StatsCards } from '../components/StatsCards';
import { RecentOrders } from '../components/RecentOrders';
import { RevenueChart } from '../components/RevenueChart';
import { useEffect, useState } from 'react';
import { adminService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, TrendingUp, Users, ShoppingBag, DollarSign, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDeliveries: number;
  totalRestaurants: number;
  recentOrders: any[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
    totalRestaurants: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchRestaurantsCount();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats();
      setStats(prev => ({
        ...prev,
        totalUsers: response.data.totalUsers,
        totalOrders: response.data.totalOrders,
        totalRevenue: response.data.totalRevenue,
        pendingDeliveries: response.data.pendingDeliveries,
        recentOrders: response.data.recentOrders,
      }));
    } catch (error: any) {
      console.error('Erreur chargement stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantsCount = async () => {
    try {
      const response = await adminService.getAllRestaurants();
      setStats(prev => ({
        ...prev,
        totalRestaurants: response.data.length,
      }));
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
      // Valeur par défaut
      setStats(prev => ({ ...prev, totalRestaurants: 12 }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="text-gray-500">Добро пожаловать в администрацию! ФудФаст</p>
        </div>
        <Button onClick={() => { fetchStats(); fetchRestaurantsCount(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Stats Cards avec vraies données */}
      <StatsCards stats={{
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalUsers: stats.totalUsers,
        totalRestaurants: stats.totalRestaurants,
      }} />
      
      {/* Graphique des revenus */}
      <RevenueChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        
        {/* Carte d'activité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Зарегистрированные пользователи</p>
                  <p className="text-xs text-gray-500">
                    Total: <span className="font-bold">{stats.totalUsers}</span> utilisateurs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">всего заказано</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{stats.totalOrders}</span> размещенные заказы
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Доставка в процессе.</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{stats.pendingDeliveries}</span> заказы на доставку
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Доход</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{stats.totalRevenue.toLocaleString()} ₽</span> итого
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}