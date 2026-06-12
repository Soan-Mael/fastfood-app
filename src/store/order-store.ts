// src/store/order-store.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { orderService } from '@/services/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  restaurantId: string;
  restaurantName: string;
  total: number;
  status: 'confirmed' | 'preparing' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  address: string;
  paymentMethod: string;
  estimatedDelivery: string;
  createdAt: Date;
  addressDetails?: any;
  stripePaymentId?: string;
  userName?: string;
  userPhone?: string;
}

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateLocalOrderStatus: (orderId: string, newStatus: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrders: () => void;
  fetchOrders: () => Promise<void>;
}

// Création du store avec Zustand
export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  
  addOrder: (orderData) => {
    const id = uuidv4();
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: new Date(),
    };
    
    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));
    
    return id;
  },
  
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));
  },
  
  // Nouvelle méthode pour mise à jour locale (via WebSocket)
  updateLocalOrderStatus: (orderId: string, newStatus: string) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ),
    }));
  },
  
  getOrderById: (orderId) => {
    return get().orders.find((order) => order.id === orderId);
  },
  
  clearOrders: () => {
    set({ orders: [] });
  },
  
  // Nouvelle méthode pour charger les commandes depuis l'API
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await orderService.getUserOrders();
      // Transformer les données de l'API pour correspondre au format du store
      const apiOrders = response.data.map((apiOrder: any) => ({
        id: apiOrder._id,
        orderNumber: apiOrder.orderNumber,
        items: apiOrder.items,
        restaurantId: apiOrder.restaurantId,
        restaurantName: apiOrder.restaurantName,
        total: apiOrder.total,
        status: apiOrder.status,
        address: apiOrder.address,
        paymentMethod: apiOrder.paymentMethod,
        estimatedDelivery: apiOrder.estimatedDelivery,
        createdAt: new Date(apiOrder.createdAt),
        addressDetails: apiOrder.addressDetails,
        stripePaymentId: apiOrder.stripePaymentId,
        userName: apiOrder.userName,
        userPhone: apiOrder.userPhone,
      }));
      set({ orders: apiOrders, isLoading: false });
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      set({ isLoading: false });
    }
  },
}));