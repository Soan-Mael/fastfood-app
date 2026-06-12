import { useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  Pizza, 
  Beef, 
  Salad, 
  Coffee, 
  Dessert, 
  Fish, 
  Sandwich
} from "lucide-react"

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

const categories: Category[] = [
  { id: "all", name: "Все", icon: null },
  { id: "pizza", name: "Пицца", icon: <Pizza className="h-4 w-4" /> },
  { id: "burger", name: "Бургеры", icon: <Beef className="h-4 w-4" /> },
  { id: "salad", name: "Здоровое", icon: <Salad className="h-4 w-4" /> },
  { id: "coffee", name: "Кафе", icon: <Coffee className="h-4 w-4" /> },
  { id: "dessert", name: "Десерты", icon: <Dessert className="h-4 w-4" /> },
  { id: "seafood", name: "Морепродукты", icon: <Fish className="h-4 w-4" /> },
  { id: "sandwich", name: "Сэндвичи", icon: <Sandwich className="h-4 w-4" /> },
]

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-2 p-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="flex items-center gap-1.5"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}