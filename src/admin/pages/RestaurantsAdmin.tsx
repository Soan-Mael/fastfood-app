// src/admin/pages/RestaurantsAdmin.tsx
import { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Store, 
  Star, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Eye, 
  Plus,
  Trash2,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function RestaurantsAdmin() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllRestaurants();
      if (response.data && response.data.length > 0) {
        setRestaurants(response.data);
      } else {
        // Données par défaut avec les restaurants de la capture
        setRestaurants(defaultRestaurants);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      // Données par défaut avec les restaurants de la capture
      setRestaurants(defaultRestaurants);
      toast({
        title: "Information",
        description: "Affichage des données de démonstration",
      });
    } finally {
      setLoading(false);
    }
  };

  // Liste des restaurants par défaut (comme dans la capture)
  const defaultRestaurants: Restaurant[] = [
    {
      _id: '1',
      name: 'Пицца Итальяно',
      email: 'contact@pizzaitaliano.ru',
      phone: '+7 999 123-45-67',
      address: 'Moscou, rue Tverskaya, 15',
      cuisine: 'Итальянская',
      description: 'Лучшая пицца в Москве. Традиционные итальянские рецепты, свежие ингредиенты',
      image: '',
      rating: 4.8,
      deliveryTime: '20-35 мин',
      deliveryFee: 199,
      minOrder: 500,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Суши Мастер',
      email: 'info@sushimaster.ru',
      phone: '+7 999 234-56-78',
      address: 'Moscou, rue Arbat, 25',
      cuisine: 'Японская',
      description: 'Свежие суши и роллы. Доставка японской кухни',
      image: '',
      rating: 4.8,
      deliveryTime: '25-40 мин',
      deliveryFee: 249,
      minOrder: 800,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      name: 'Свежесть и Здоровье',
      email: 'health@freshfood.ru',
      phone: '+7 999 345-67-89',
      address: 'Moscou, rue Lénine, 50',
      cuisine: 'Здоровая',
      description: 'Здоровое питание, салаты, полезные блюда',
      image: '',
      rating: 4.8,
      deliveryTime: '15-25 мин',
      deliveryFee: 199,
      minOrder: 400,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '4',
      name: 'Сладкие Радости',
      email: 'sweet@desserts.ru',
      phone: '+7 999 456-78-90',
      address: 'Moscou, rue Arbatskaya, 10',
      cuisine: 'Кондитерская',
      description: 'Выпечка и десерты. Торты, пирожные, сладости',
      image: '',
      rating: 4.8,
      deliveryTime: '15-30 мин',
      deliveryFee: 199,
      minOrder: 300,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '5',
      name: 'Burger King',
      email: 'burgerking@mail.ru',
      phone: '+7 999 567-89-01',
      address: 'Moscou, rue du Centre, 100',
      cuisine: 'Американская',
      description: 'Бургеры, фри, fast-food',
      image: '',
      rating: 4.5,
      deliveryTime: '20-35 мин',
      deliveryFee: 199,
      minOrder: 400,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '6',
      name: 'KFC',
      email: 'kfc@kfc.ru',
      phone: '+7 999 678-90-12',
      address: 'Moscou, rue de la Gare, 5',
      cuisine: 'Американская',
      description: 'Poulet frit, tenders, burgers',
      image: '',
      rating: 4.4,
      deliveryTime: '20-30 мин',
      deliveryFee: 199,
      minOrder: 350,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '7',
      name: 'McDonald\'s',
      email: 'mcdonalds@mcd.ru',
      phone: '+7 999 789-01-23',
      address: 'Moscou, rue de l\'Est, 20',
      cuisine: 'Американская',
      description: 'Burgers, nuggets, happy meal',
      image: '',
      rating: 4.3,
      deliveryTime: '15-25 мин',
      deliveryFee: 199,
      minOrder: 300,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const updateRestaurantStatus = async (restaurantId: string, isActive: boolean) => {
    try {
      await adminService.updateRestaurantStatus(restaurantId, isActive);
      setRestaurants(restaurants.map(r => 
        r._id === restaurantId ? { ...r, isActive } : r
      ));
      toast({
        title: "Succès",
        description: `Restaurant ${isActive ? 'activé' : 'désactivé'} avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const deleteRestaurant = async (restaurantId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
      try {
        await adminService.deleteRestaurant(restaurantId);
        setRestaurants(restaurants.filter(r => r._id !== restaurantId));
        toast({
          title: "Succès",
          description: "Restaurant supprimé avec succès",
        });
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Impossible de supprimer le restaurant",
          variant: "destructive",
        });
      }
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const stats = {
    total: restaurants.length,
    active: restaurants.filter(r => r.isActive).length,
    inactive: restaurants.filter(r => !r.isActive).length,
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
          <h1 className="text-2xl font-bold">Управление ресторанами</h1>
          <p className="text-gray-500">Просмотр и управление всеми ресторанами платформы</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRestaurants} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="bg-orange-500 hover:bg-orange-600" 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить ресторан
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Всего ресторанов</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Активных</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Store className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Неактивных</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
              <Store className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Все рестораны</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию, кухне или адресу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRestaurants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Рестораны не найдены</p>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <div key={restaurant._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-lg">
                        {getInitials(restaurant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{restaurant.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs">{restaurant.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {restaurant.deliveryTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {restaurant.cuisine}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {restaurant.deliveryFee} ₽
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Мин. заказ: {restaurant.minOrder} ₽
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                      {restaurant.isActive ? "Активен" : "Неактивен"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRestaurantStatus(restaurant._id, !restaurant.isActive)}
                    >
                      {restaurant.isActive ? "Дез активировать" : "Активировать"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteRestaurant(restaurant._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Détails Restaurant */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Детали ресторана</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRestaurant(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                      {getInitials(selectedRestaurant.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRestaurant.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedRestaurant.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <p className="font-medium">{selectedRestaurant.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <p className="font-medium">{selectedRestaurant.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Кухня</p>
                    <p className="font-medium">{selectedRestaurant.cuisine}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="font-medium">{selectedRestaurant.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Время доставки</p>
                    <p className="font-medium">{selectedRestaurant.deliveryTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Стоимость доставки</p>
                    <p className="font-medium">{selectedRestaurant.deliveryFee} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Мин. заказ</p>
                    <p className="font-medium">{selectedRestaurant.minOrder} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Статус</p>
                    <Badge variant={selectedRestaurant.isActive ? "default" : "secondary"}>
                      {selectedRestaurant.isActive ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                </div>

                {selectedRestaurant.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">Описание</p>
                    <p className="text-sm mt-1">{selectedRestaurant.description}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="text-sm">{formatDate(selectedRestaurant.createdAt)}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateRestaurantStatus(selectedRestaurant._id, !selectedRestaurant.isActive);
                      setSelectedRestaurant(null);
                    }}
                  >
                    {selectedRestaurant.isActive ? "Дез активировать" : "Активировать"}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      deleteRestaurant(selectedRestaurant._id);
                      setSelectedRestaurant(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Ajouter Restaurant (simplifié) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Добавить ресторан</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Formulaire d'ajout à venir...
              </p>
              <Button 
                className="w-full" 
                onClick={() => setShowAddModal(false)}
              >
                Закрыть
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}