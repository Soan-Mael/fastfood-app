import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Star } from "lucide-react"

interface Dish {
  id: string
  name: string
  image: string
  restaurant: string
  price: string
  rating: number
}

const popularDishes: Dish[] = [
  {
    id: "1",
    name: "Пицца Маргарита",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&h=400&fit=crop",
    restaurant: "Pizza Italiano",
    price: "245.99₽",
    rating: 4.8
  },
  {
    id: "2",
    name: "Двойной чизбургер",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    restaurant: "Burger Heaven",
    price: "350.99₽",
    rating: 4.7
  },
  {
    id: "3",
    name: "Суши-ролл",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
    restaurant: "Sushi Master",
    price: "140.50₽",
    rating: 4.9
  },
  {
    id: "4",
    name: "Пад Тай",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
    restaurant: "Thai Flavors",
    price: "140.99₽",
    rating: 4.6
  },
  {
    id: "5",
    name: "Салат Цезарь с курицей",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    restaurant: "Fresh & Healthy",
    price: "350.99₽",
    rating: 4.5
  },
  {
    id: "6",
    name: "Шоколадный брауни",
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=400&fit=crop",
    restaurant: "Sweet Treats",
    price: "350.99₽",
    rating: 4.8
  }
]

export function PopularDishes() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Популярные блюда</h2>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-4">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="food-card w-[250px] overflow-hidden rounded-xl"
            >
              <div className="overflow-hidden rounded-t-xl">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="food-card-image"
                  width={250}
                  height={150}
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{dish.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{dish.restaurant}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">{dish.price}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="fill-yellow-500 h-4 w-4" />
                    <span className="text-sm">{dish.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}