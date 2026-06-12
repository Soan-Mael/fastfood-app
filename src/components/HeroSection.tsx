import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const [address, setAddress] = useState("")
  const navigate = useNavigate()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/restaurants")
  }
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1600&h=900&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          filter: "brightness(0.45)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 md:py-28 lg:py-36 text-center text-white">
        <h1 className="max-w-4xl text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
          Вкусная еда с быстрой доставкой
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-gray-200">
          Заказывайте еду из лучших местных ресторанов с быстрой доставкой прямо к вашей двери
        </p>
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Введите адрес доставки"
              className="w-full rounded-full pl-10 h-12 bg-white/95 text-foreground"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="h-12 px-8 rounded-full text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            Найти еду
          </Button>
        </form>
      </div>
    </div>
  )
}