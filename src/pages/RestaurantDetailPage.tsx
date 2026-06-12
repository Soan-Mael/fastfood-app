import { useState } from "react"
import { useParams } from "react-router-dom"
import Header from "@/components/Header"
import { Footer } from "@/components/Footer" 
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Clock, MapPin, Plus } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useToast } from "@/hooks/use-toast"

// Fonction pour formater les prix en roubles
const formatPrice = (price: number) => {
  return `${price.toLocaleString('ru-RU')} ₽`
}

// Restaurant data with Lipetsk address
const restaurantDetails = {
  id: "1",
  name: "Пицца Итальяно",
  image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=1200&h=400&fit=crop",
  cuisine: "Итальянская • Пицца",
  rating: 4.8,
  reviews: 243,
  deliveryTime: "20-35 мин",
  deliveryFee: "199 ₽",
  address: "ул. Советская, 45, Липецк",
  phone: "+7 (4742) 12-34-56",
  hours: "10:00 - 23:00",
  description: "Аутентичная итальянская пицца из свежих ингредиентов. Тесто готовится ежедневно вручную. Доставка по Липецку."
}

// Sample menu categories and items with prices in rubles
const menuCategories = [
  {
    id: "popular",
    name: "Популярное",
    items: [
      {
        id: "p1",
        name: "Пицца Маргарита",
        description: "Классический томатный соус, моцарелла, свежий базилик",
        price: 1299,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop"
      },
      {
        id: "p2",
        name: "Пицца Пепперони",
        description: "Томатный соус, моцарелла, пепперони",
        price: 1499,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop"
      },
      {
        id: "p3",
        name: "Чесночный хлеб",
        description: "Тёплый хлеб с чесночным маслом и травами",
        price: 599,
        image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    id: "pizza",
    name: "Пиццы",
    items: [
      {
        id: "pz1",
        name: "Пицца Маргарита",
        description: "Классический томатный соус, моцарелла, свежий базилик",
        price: 1299,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop"
      },
      {
        id: "pz2",
        name: "Пицца Пепперони",
        description: "Томатный соус, моцарелла, пепперони",
        price: 1499,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop"
      },
      {
        id: "pz3",
        name: "Пицца Четыре сыра",
        description: "Моцарелла, пармезан, фонтана, горгонзола",
        price: 1699,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop"
      },
      {
        id: "pz4",
        name: "Вегетарианская пицца",
        description: "Болгарский перец, лук, грибы, оливки, томаты",
        price: 1599,
        image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    id: "pasta",
    name: "Паста",
    items: [
      {
        id: "pa1",
        name: "Спагетти Болоньезе",
        description: "Классический мясной соус с травами и пармезаном",
        price: 1399,
        image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=300&h=200&fit=crop"
      },
      {
        id: "pa2",
        name: "Феттуччини Альфредо",
        description: "Сливочный соус с пармезаном, чесноком и чёрным перцем",
        price: 1499,
        image: "https://images.unsplash.com/photo-1645112411341-6c4fd023a3a2?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    id: "drinks",
    name: "Напитки",
    items: [
      {
        id: "dr1",
        name: "Кока-Кола",
        description: "0.5 л",
        price: 199,
        image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop"
      },
      {
        id: "dr2",
        name: "Спрайт",
        description: "0.5 л",
        price: 199,
        image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop"
      },
      {
        id: "dr3",
        name: "Морс клюквенный",
        description: "Домашний морс",
        price: 149,
        image: "https://images.unsplash.com/photo-1519923834699-ef8b94b22b39?w=300&h=200&fit=crop"
      },
      {
        id: "dr4",
        name: "Чай чёрный",
        description: "Горячий чай с лимоном",
        price: 99,
        image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&h=200&fit=crop"
      }
    ]
  }
]

function RestaurantDetailPage() {
  const { restaurantId } = useParams()
  const [activeTab, setActiveTab] = useState("popular")
  const { addItem } = useCartStore()
  const { toast } = useToast()
  
  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      restaurantId: restaurantDetails.id,
      restaurantName: restaurantDetails.name
    });
    
    toast({
      title: "Добавлено в корзину",
      description: `${item.name} • ${formatPrice(item.price)}`,
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Restaurant Header */}
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={restaurantDetails.image}
            alt={restaurantDetails.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{restaurantDetails.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span>{restaurantDetails.cuisine}</span>
              <span className="text-white/70">•</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{restaurantDetails.rating} ({restaurantDetails.reviews} отзывов)</span>
              </div>
              <span className="text-white/70">•</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{restaurantDetails.deliveryTime}</span>
              </div>
              <span className="text-white/70">•</span>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{restaurantDetails.address}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-4 border-b">
                    <TabsList className="h-12">
                      {menuCategories.map((category) => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id}
                          className="data-[state=active]:bg-primary/5"
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  {menuCategories.map((category) => (
                    <TabsContent 
                      key={category.id} 
                      value={category.id}
                      className="p-4 pt-6"
                    >
                      <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
                      <div className="grid gap-4">
                        {category.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex flex-col md:flex-row items-start gap-4 border-b pb-4 last:border-b-0"
                          >
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full md:w-24 h-24 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-medium">{item.name}</h3>
                              <p className="text-muted-foreground">{item.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-medium">{formatPrice(item.price)}</span>
                                <Button 
                                  size="sm" 
                                  className="flex items-center gap-1"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            
            <div>
              <div className="bg-white shadow-sm rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-4">Информация о ресторане</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Часы работы</h3>
                    <p className="text-muted-foreground">{restaurantDetails.hours}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Адрес</h3>
                    <p className="text-muted-foreground">{restaurantDetails.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">📍 Липецк, Россия</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Телефон</h3>
                    <p className="text-muted-foreground">{restaurantDetails.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">О нас</h3>
                    <p className="text-muted-foreground">{restaurantDetails.description}</p>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Заказать доставку
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default RestaurantDetailPage