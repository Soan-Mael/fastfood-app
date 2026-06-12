import { Star, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export interface RestaurantProps {
  id: string
  name: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  promoted?: boolean
}

export function RestaurantCard({
  id,
  name,
  image,
  cuisine,
  rating,
  deliveryTime,
  deliveryFee,
  promoted = false,
}: RestaurantProps) {
  return (
    <Link to={`/restaurant/${id}`}>
      <div className="food-card group">
        <div className="overflow-hidden rounded-t-xl">
          <img
            src={image}
            alt={name}
            className="food-card-image"
            width={400}
            height={225}
          />
          {promoted && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-primary/90 hover:bg-primary text-white">
                Promoted
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="fill-yellow-500 h-4 w-4" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{cuisine}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{deliveryTime}</span>
            </div>
            <span className="text-muted-foreground">{deliveryFee}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}