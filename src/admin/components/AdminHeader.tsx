// src/admin/components/AdminHeader.tsx
import { useState } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { AdminNotifications } from '@/components/AdminNotifications';

export function AdminHeader() {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications - Composant ajouté */}
        <AdminNotifications />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs">Administrateur</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}