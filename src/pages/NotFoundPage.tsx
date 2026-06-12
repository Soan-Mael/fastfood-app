import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Frown } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <Frown className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Страница не найдена</h1>
        <p className="max-w-md text-muted-foreground">
          Извините, мы не смогли найти страницу, которую вы ищете. Возможно, она была удалена или перемещена.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link to="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}