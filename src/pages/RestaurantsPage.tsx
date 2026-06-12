import { useState } from "react"
import Header from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CategoryFilter } from "@/components/CategoryFilter"
import { RestaurantCard } from "@/components/RestaurantCard"
import { cn } from "@/lib/utils"

// Sample restaurants data for Lipetsk with prices in rubles
const restaurants = [
  {
    id: "1",
    name: "Пицца Итальяно",
    image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=600&h=350&fit=crop",
    cuisine: "Итальянская • Пицца",
    rating: 4.8,
    deliveryTime: "20-35 мин",
    deliveryFee: "199 ₽",
    address: "ул. Советская, 45, Липецк",
    promoted: true
  },
  {
    id: "2",
    name: "Burger Heaven",
    image: "https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=600&h=350&fit=crop",
    cuisine: "Американская • Бургеры",
    rating: 4.5,
    deliveryTime: "15-25 мин",
    deliveryFee: "199 ₽",
    address: "ул. Неделина, 15, Липецк",
  },
  {
    id: "3",
    name: "Суши Мастер",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=350&fit=crop",
    cuisine: "Японская • Суши",
    rating: 4.9,
    deliveryTime: "25-40 мин",
    deliveryFee: "249 ₽",
    address: "пр. Победы, 28, Липецк",
    promoted: true
  },
  {
    id: "4",
    name: "Такерия",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=350&fit=crop",
    cuisine: "Мексиканская • Тако",
    rating: 4.3,
    deliveryTime: "15-30 мин",
    deliveryFee: "199 ₽",
    address: "ул. Ленина, 56, Липецк",
  },
  {
    id: "5",
    name: "Свежесть и Здоровье",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=350&fit=crop",
    cuisine: "Здоровая еда • Салаты",
    rating: 4.7,
    deliveryTime: "15-25 мин",
    deliveryFee: "199 ₽",
    address: "ул. Ленина, 12, Липецк",
  },
  {
    id: "6",
    name: "Wok & Co",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=350&fit=crop",
    cuisine: "Азиатская • Wok",
    rating: 4.6,
    deliveryTime: "20-30 мин",
    deliveryFee: "199 ₽",
    address: "ул. Катукова, 44, Липецк",
  },
  {
    id: "7",
    name: "Сладкие Радости",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop",
    cuisine: "Кондитерская • Десерты",
    rating: 4.8,
    deliveryTime: "15-30 мин",
    deliveryFee: "199 ₽",
    address: "ул. Гагарина, 56, Липецк",
  },
  {
    id: "8",
    name: "Индийские Специи",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356cf7?w=600&h=350&fit=crop",
    cuisine: "Индийская • Карри",
    rating: 4.7,
    deliveryTime: "25-40 мин",
    deliveryFee: "299 ₽",
    address: "ул. Фрунзе, 23, Липецк",
  },
  {
    id: "9",
    name: "Додо Пицца",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=350&fit=crop",
    cuisine: "Итальянская • Пицца",
    rating: 4.8,
    deliveryTime: "25-40 мин",
    deliveryFee: "199 ₽",
    address: "ул. Катукова, 44, Липецк",
  },
  {
    id: "10",
    name: "KFC",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=350&fit=crop",
    cuisine: "Американская • Курица",
    rating: 4.3,
    deliveryTime: "20-30 мин",
    deliveryFee: "199 ₽",
    address: "ул. Космонавтов, 8, Липецк",
  },
  {
    id: "11",
    name: "McDonald's",
    image: "https://images.unsplash.com/photo-1613769049987-b96a8efbfe01?w=600&h=350&fit=crop",
    cuisine: "Американская • Фастфуд",
    rating: 4.2,
    deliveryTime: "15-25 мин",
    deliveryFee: "199 ₽",
    address: "пл. Плеханова, 10, Липецк",
  },
  {
    id: "12",
    name: "Тануки",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=350&fit=crop",
    cuisine: "Японская • Суши",
    rating: 4.5,
    deliveryTime: "30-45 мин",
    deliveryFee: "299 ₽",
    address: "ул. Фрунзе, 23, Липецк",
  }
]

// Sort options in Russian
const sortOptions = [
  { value: "recommended", label: "Рекомендуемые" },
  { value: "rating", label: "По рейтингу (высокий → низкий)" },
  { value: "delivery", label: "По времени доставки (быстро → медленно)" },
  { value: "price", label: "По стоимости доставки (дешевле → дороже)" }
]

// Filter options in Russian
const filterOptions = [
  { value: "promoted", label: "Рекомендуемые рестораны" },
  { value: "free-delivery", label: "Бесплатная доставка" },
  { value: "top-rated", label: "Высокий рейтинг (4.5+)" }
]

function RestaurantsPage() {
  const [activeSort, setActiveSort] = useState("recommended")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }
  
  // Filter and sort restaurants
  let filteredRestaurants = [...restaurants]
  
  // Apply filters
  if (activeFilters.includes("promoted")) {
    filteredRestaurants = filteredRestaurants.filter(r => r.promoted)
  }
  if (activeFilters.includes("free-delivery")) {
    filteredRestaurants = filteredRestaurants.filter(r => r.deliveryFee === "0 ₽" || r.deliveryFee === "Бесплатно")
  }
  if (activeFilters.includes("top-rated")) {
    filteredRestaurants = filteredRestaurants.filter(r => r.rating >= 4.5)
  }
  
  // Apply sorting
  if (activeSort === "rating") {
    filteredRestaurants.sort((a, b) => b.rating - a.rating)
  } else if (activeSort === "delivery") {
    filteredRestaurants.sort((a, b) => {
      const timeA = parseInt(a.deliveryTime.split("-")[0])
      const timeB = parseInt(b.deliveryTime.split("-")[0])
      return timeA - timeB
    })
  } else if (activeSort === "price") {
    filteredRestaurants.sort((a, b) => {
      const priceA = parseInt(a.deliveryFee.replace(/[^0-9]/g, ''))
      const priceB = parseInt(b.deliveryFee.replace(/[^0-9]/g, ''))
      return priceA - priceB
    })
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Рестораны Липецка</h1>
          <p className="text-muted-foreground mb-6">
            🍽️ Более {restaurants.length} ресторанов готовы доставить ваш заказ
          </p>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Поиск по кухне</h2>
            <CategoryFilter />
          </div>
          
          {/* Sort and Filter Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleFilter(option.value)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full whitespace-nowrap border",
                    activeFilters.includes(option.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input text-muted-foreground hover:border-primary hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Сортировать:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 bg-background"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Найдено: {filteredRestaurants.length} ресторанов
          </p>
          
          {/* Restaurant Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image}
                cuisine={restaurant.cuisine}
                rating={restaurant.rating}
                deliveryTime={restaurant.deliveryTime}
                deliveryFee={restaurant.deliveryFee}
                promoted={restaurant.promoted}
              />
            ))}
          </div>
          
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Рестораны не найдены</p>
              <button
                onClick={() => {
                  setActiveFilters([])
                  setActiveSort("recommended")
                }}
                className="mt-2 text-primary hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default RestaurantsPage