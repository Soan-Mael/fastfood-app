import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "@/pages/HomePage";
import RestaurantsPage from "@/pages/RestaurantsPage";
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UserRegistrationPage from "@/pages/UserRegistrationPage";
import LoginPage from "@/pages/LoginPage";
import RestaurantRegistrationPage from "@/pages/RestaurantRegistrationPage";
import OrdersPage from '@/pages/OrdersPage';
import TrackingPage from '@/pages/TrackingPage';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Chatbot } from "@/components/Chatbot";
import { useAuthStore } from "@/store/auth-store";
import { initializeSocket, disconnectSocket } from "@/services/socket";
import { initializeUserSocket, disconnectUserSocket } from "@/services/socketClient";

// Imports administrateur
import { AdminLayout } from '@/admin/components/AdminLayout';
import { Dashboard } from '@/admin/pages/Dashboard';
import { OrdersAdmin } from '@/admin/pages/OrdersAdmin';
import { RestaurantsAdmin } from '@/admin/pages/RestaurantsAdmin';
import { UsersAdmin } from '@/admin/pages/UsersAdmin';
import { Analytics } from '@/admin/pages/Analytics';
import { Settings } from '@/admin/pages/Settings';
import { AdminLoginPage } from '@/pages/AdminLoginPage';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Initialisation WebSocket pour l'admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      console.log('🔌 Initialisation WebSocket pour admin...');
      initializeSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  // Initialisation WebSocket pour les clients (utilisateurs normaux)
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      console.log('🔌 Initialisation WebSocket pour client...');
      initializeUserSocket();
    }
    return () => {
      disconnectUserSocket();
    };
  }, [isAuthenticated, user]);

  return (
    <TooltipProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/register" element={<UserRegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restaurant-register" element={<RestaurantRegistrationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tracking/:orderId" element={<TrackingPage />} />
          
          {/* Routes administrateur */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="restaurants" element={<RestaurantsAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Route 404 - doit être en dernier */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      
      {/* Chatbot flottant - visible sur toutes les pages */}
      <Chatbot />
    </TooltipProvider>
  );
}

export default App;