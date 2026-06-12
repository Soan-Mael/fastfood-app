// src/admin/components/RevenueChart.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/api';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

type Period = 'day' | 'week' | 'month';

interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
}

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getRevenueStats(period);
      console.log('Données revenus reçues:', response.data);
      setData(response.data);
      
      // Calculer les totaux
      const revenueSum = response.data.reduce((sum: number, item: RevenueData) => sum + item.revenue, 0);
      const ordersSum = response.data.reduce((sum: number, item: RevenueData) => sum + item.orders, 0);
      setTotalRevenue(revenueSum);
      setTotalOrders(ordersSum);
    } catch (error: any) {
      console.error('Erreur chargement revenus:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de charger les statistiques",
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ₽`;
    }
    return `${value} ₽`;
  };

  const getChartComponent = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune donnée de revenus disponible</p>
            <p className="text-sm mt-1">Les commandes livrées apparaîtront ici</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    if (period === 'day') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis tickFormatter={formatRevenue} />
          <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ₽`, 'Revenus']} />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#revenueGradient)"
            name="Revenus"
          />
        </AreaChart>
      );
    }
    
    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" tickFormatter={formatRevenue} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip formatter={(value: number, name: string) => {
          if (name === 'revenue') return [`${value.toFixed(2)} ₽`, 'Revenus'];
          return [value, 'Commandes'];
        }} />
        <Legend />
        <Bar yAxisId="left" dataKey="revenue" fill="#f97316" name="Доходы" radius={[8, 8, 0, 0]} />
        <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Заказы" radius={[8, 8, 0, 0]} />
      </BarChart>
    );
  };

  const periodLabels = {
    day: 'ежедневно',
    week: 'недельный',
    month: 'ежемесячно',
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Анализ доходов
          </CardTitle>
          
          {/* Sélecteur de période */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={period === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('day')}
              className={period === 'day' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Jour
            </Button>
            <Button
              variant={period === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('week')}
              className={period === 'week' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Semaine
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('month')}
              className={period === 'month' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Mois
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des revenus</p>
                <p className="text-2xl font-bold text-orange-600">{totalRevenue.toLocaleString()} ₽</p>
                <p className="text-xs text-gray-400 mt-1">période {periodLabels[period]}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des commandes</p>
                <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                <p className="text-xs text-gray-400 mt-1">période {periodLabels[period]}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {getChartComponent()}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}