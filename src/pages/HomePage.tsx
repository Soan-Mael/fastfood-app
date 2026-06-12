import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { CategoryFilter } from '@/components/CategoryFilter'
import { RestaurantCard } from '@/components/RestaurantCard'
import { PopularDishes } from '@/components/PopularDishes'
import { Testimonials } from '@/components/Testimonials'
import { ShoppingBag, Phone, Smartphone, Clock } from 'lucide-react'

// Featured restaurants
const featuredRestaurants = [
  {
    id: "1",
    name: "Пицца Итальяно",
    image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=600&h=350&fit=crop",
    cuisine: "Итальянская • Пицца",
    rating: 4.8,
    deliveryTime: "20-35 мин",
    deliveryFee: "199 ₽",
    promoted: true
  },
  {
    id: "3",
    name: "Суши Мастер",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=350&fit=crop",
    cuisine: "Японская • Суши",
    rating: 4.9,
    deliveryTime: "25-40 мин",
    deliveryFee: "249 ₽",
    promoted: true
  },
  {
    id: "5",
    name: "Свежесть и Здоровье",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=350&fit=crop",
    cuisine: "Здоровая пища • Салаты",
    rating: 4.7,
    deliveryTime: "15-25 мин",
    deliveryFee: "199 ₽",
  },
  {
    id: "7",
    name: "Сладкие Радости",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop",
    cuisine: "Выпечка • Десерты",
    rating: 4.8,
    deliveryTime: "15-30 мин",
    deliveryFee: "199 ₽",
  }
]

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="container py-12">
          <h2 className="text-2xl font-bold mb-6">Выбрать по категории</h2>
          <CategoryFilter />
          
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Популярные рестораны</h2>
              <Button variant="outline" asChild>
                <a href="/restaurants">Показать все</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  {...restaurant}
                />
              ))}
            </div>
          </div>
          
          <PopularDishes />
          
          {/* How it works section */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Как работает ФудФаст</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Выберите и закажите</h3>
                <p className="text-muted-foreground">Просматривайте рестораны и меню, затем оформите заказ всего за несколько нажатий.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Отслеживание в реальном времени</h3>
                <p className="text-muted-foreground">Отслеживайте движение вашего заказа от ресторана до двери в режиме реального времени.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Наслаждайтесь едой</h3>
                <p className="text-muted-foreground">Ваша вкусная еда прибывает к вашей двери свежей и готовой к употреблению.</p>
              </div>
            </div>
          </section>
        </div>
        
        <Testimonials />
        
        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Голодны? Мы всего в одном клике</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Скачайте приложение ФудФаст сейчас и получите бесплатную доставку первого заказа!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary">
                Скачать для iOS
              </Button>
              <Button size="lg" variant="secondary">
                Скачать для Android
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Phone className="h-5 w-5 mr-2" />
                Заказать по телефону
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default HomePage