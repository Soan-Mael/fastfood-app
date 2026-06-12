// src/admin/components/AdminSidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  BarChart3,
  Settings,
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { path: '/admin/dashboard', label: 'Панель управления', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { path: '/admin/restaurants', label: 'Рестораны', icon: Store },
  { path: '/admin/users', label: 'Пользователи', icon: Users },
  { path: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
  { path: '/admin/settings', label: 'Настройки', icon: Settings },
];

export function AdminSidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold">ФудФаст Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}