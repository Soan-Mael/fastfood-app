import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  User, 
  Home, 
  MapPin,
  LogIn,
  UserPlus,
  Store,
  Clock,
  LogOut,
  Shield,
  LayoutDashboard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartComponent } from "./CartComponent"
import { useAuthStore } from "@/store/auth-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
}

const navigation: NavigationItem[] = [
  { name: "Главная", href: "/", icon: <Home className="h-5 w-5" /> },
  { name: "Рестораны", href: "/restaurants", icon: <MapPin className="h-5 w-5" /> },
  { name: "Заказы", href: "/orders", icon: <Clock className="h-5 w-5" /> },
]

export default function Header() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Переключить меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link to="/" className="flex items-center gap-2 text-lg font-bold">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span>ФудФаст</span>
                  </Link>
                  <div className="grid gap-3">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    {!isAuthenticated ? (
                      <>
                        <Link
                          to="/login"
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <LogIn className="h-5 w-5" />
                          Войти
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <UserPlus className="h-5 w-5" />
                          Регистрация
                        </Link>
                      </>
                    ) : (
                      <>
                        {user?.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                          >
                            <Shield className="h-5 w-5" />
                            Панель администратора
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 w-full"
                        >
                          <LogOut className="h-5 w-5" />
                          Выйти
                        </button>
                      </>
                    )}
                    <Link
                      to="/restaurant-register"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Store className="h-5 w-5" />
                      Регистрация ресторана
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="hidden md:inline">ФудФаст</span>
          </Link>
          {!isMobile && (
            <nav className="flex gap-5 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск ресторанов или блюд..."
              className="w-full rounded-full bg-background pl-8 md:w-[240px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Cart */}
          <CartComponent />
          
          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {isAuthenticated && user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">Аккаунт пользователя</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {user.role === "admin" && (
                        <span className="text-xs text-orange-600 mt-1">Администратор</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      История заказов
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="flex items-center cursor-pointer text-orange-600">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Панель администратора
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      Войти
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register" className="flex items-center cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Регистрация
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/restaurant-register" className="flex items-center cursor-pointer">
                      <Store className="mr-2 h-4 w-4" />
                      Регистрация ресторана
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            size="sm" 
            className="hidden md:flex"
            onClick={() => navigate("/restaurants")}
          >
            Заказать сейчас
          </Button>
        </div>
      </div>
    </header>
  )
}