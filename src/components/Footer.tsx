import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ФудФаст</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Вкусные блюда с доставкой к вашей двери. Быстро, свежо и удобно.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Исследовать</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/restaurants" className="text-muted-foreground hover:text-foreground">
                  Рестораны
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-muted-foreground hover:text-foreground">
                  Специальные предложения
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Цены и комиссии
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Компания</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-foreground">
                  Карьера
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground">
                  Блог
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Поддержка</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground">
                  Центр помощи
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                  Связаться с нами
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 ФудФаст. мабиала жансна.</p>
        </div>
      </div>
    </footer>
  )
}