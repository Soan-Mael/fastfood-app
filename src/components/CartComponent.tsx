import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Plus, Minus, X, ArrowRight, Clock, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useOrderStore } from "@/store/order-store";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StripePayment } from "./StripePayment";
import { orderService } from "@/services/api";
import { getDeliveryEstimate, DeliveryEstimate } from "@/services/geocoding";

export function CartComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour le calcul du temps de livraison
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [addressError, setAddressError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  // Detailed address fields
  const [addressDetails, setAddressDetails] = useState({
    city: "",
    street: "",
    house: "",
    entrance: "",
    apartment: "",
    floor: "",
    comment: "",
    promoCode: ""
  });

  const { 
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart
  } = useCartStore();

  const { addOrder } = useOrderStore();

  // Calculer le total final avec promo
  const getFinalTotal = () => {
    const subtotal = totalPrice();
    const deliveryFee = 199;
    const isPromoApplied = addressDetails.promoCode.toLowerCase() === "welcome10";
    const discount = isPromoApplied ? subtotal * 0.1 : 0;
    return subtotal + deliveryFee - discount;
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddressDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFormattedAddress = () => {
    const { city, street, house, entrance, apartment, floor } = addressDetails;
    const requiredFields = [city, street, house];
    
    if (requiredFields.some(field => !field.trim())) {
      return "";
    }

    let address = `${city}, ${street}, ${house}`;
    
    if (entrance) address += `, подъезд: ${entrance}`;
    if (apartment) address += `, кв: ${apartment}`;
    if (floor) address += `, этаж: ${floor}`;
    
    return address;
  };

  // Fonction pour calculer le temps de livraison
  const calculateDeliveryTime = async () => {
    const fullAddress = `${addressDetails.city} ${addressDetails.street} ${addressDetails.house}`;
    
    if (!fullAddress.trim() || fullAddress.length < 10) {
      setDeliveryEstimate(null);
      setAddressError("Введите полный адрес (город, улица, дом)");
      return;
    }

    setIsCalculating(true);
    setAddressError("");

    try {
      const estimate = await getDeliveryEstimate(fullAddress);
      if (estimate) {
        setDeliveryEstimate(estimate);
        setAddressError("");
      } else {
        setAddressError("Адрес не найден. Проверьте правильность ввода");
        setDeliveryEstimate(null);
      }
    } catch (error) {
      console.error("Erreur de calcul:", error);
      setAddressError("Ошибка расчета времени доставки");
    } finally {
      setIsCalculating(false);
    }
  };

  // Effet pour détecter les changements d'adresse (avec debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fullAddress = `${addressDetails.city} ${addressDetails.street} ${addressDetails.house}`;
      if (fullAddress.trim().length > 10) {
        calculateDeliveryTime();
      }
    }, 1000); // 1 seconde après la dernière frappe

    return () => clearTimeout(timeoutId);
  }, [addressDetails.city, addressDetails.street, addressDetails.house]);

  // Nouvelle fonction pour créer les commandes avec API backend
  const createOrders = async (paymentIntentId?: string) => {
    const formattedAddress = getFormattedAddress();
    const isPromoApplied = addressDetails.promoCode.toLowerCase() === "welcome10";

    // Vérifie que l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в аккаунт для оформления заказа",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    if (!formattedAddress) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните адрес доставки",
        variant: "destructive",
      });
      return false;
    }

    if (items.length === 0) return false;

    setIsSubmitting(true);

    // Group items by restaurant
    const itemsByRestaurant: Record<string, typeof items> = {};
    items.forEach((item) => {
      if (!itemsByRestaurant[item.restaurantId]) {
        itemsByRestaurant[item.restaurantId] = [];
      }
      itemsByRestaurant[item.restaurantId].push(item);
    });

    try {
      // Create an order for each restaurant
      for (const [restaurantId, restaurantItems] of Object.entries(itemsByRestaurant)) {
        const restaurantName = restaurantItems[0].restaurantName;
        const subtotal = restaurantItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = isPromoApplied ? subtotal * 0.9 : subtotal;
        const finalTotal = total + 199; // avec frais de livraison
        
        // Utiliser le temps de livraison calculé ou une valeur par défaut
        const estimatedDelivery = deliveryEstimate?.deliveryTime || 
          new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const orderData = {
          items: restaurantItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          })),
          restaurantId,
          restaurantName,
          total: finalTotal,
          address: formattedAddress,
          paymentMethod,
          estimatedDelivery,
          addressDetails: {
            ...addressDetails,
            promoApplied: isPromoApplied
          },
          stripePaymentId: paymentIntentId
        };

        // Appel API vers le backend
        const response = await orderService.createOrder(orderData);
        
        // Ajoute aussi dans le store local (pour l'historique immédiat)
        addOrder({
          ...orderData,
          status: "confirmed",
          id: response.data._id,
        });

        toast({
          title: "✅ Заказ подтвержден!",
          description: `Ваш заказ из ${restaurantName} был размещен.`,
        });
      }

      // Clear cart and reset states
      clearCart();
      setIsOpen(false);
      setIsCheckingOut(false);
      setIsProcessingPayment(false);
      
      setAddressDetails({
        city: "",
        street: "",
        house: "",
        entrance: "",
        apartment: "",
        floor: "",
        comment: "",
        promoCode: ""
      });
      
      navigate("/orders");
      return true;

    } catch (error: any) {
      console.error("Erreur lors de la commande:", error);
      toast({
        title: "❌ Ошибка",
        description: error.response?.data?.message || "Erreur lors de la création de la commande",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer la soumission du formulaire avec vérification du paiement
  const handleCheckout = async () => {
    const formattedAddress = getFormattedAddress();
    
    if (!formattedAddress) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите город, улицу и номер дома",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) return;

    // Vérifie que l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в аккаунт для оформления заказа",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Si paiement en espèces, créer directement la commande
    if (paymentMethod === "cash") {
      await createOrders();
    } else {
      // Si paiement par carte, montrer l'interface Stripe
      setIsProcessingPayment(true);
    }
  };

  // Callback quand le paiement Stripe réussit
  const handleStripeSuccess = async (paymentIntentId: string) => {
    await createOrders(paymentIntentId);
  };

  // Callback quand le paiement Stripe échoue
  const handleStripeError = (error: string) => {
    setIsProcessingPayment(false);
    toast({
      title: "Erreur de paiement",
      description: error,
      variant: "destructive",
    });
  };

  // Retour à l'étape précédente
  const handleStripeBack = () => {
    setIsProcessingPayment(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems() > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {totalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ваша корзина</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Ваша корзина пуста</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Добавьте блюда из ресторанов, чтобы начать
              </p>
            </div>
            <Button onClick={() => setIsOpen(false)}>Продолжить покупки</Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {!isCheckingOut ? (
              // Vue du panier
              <>
                <div className="flex-1 overflow-auto py-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 border-b pb-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.restaurantName}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-l-md"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantity(item.id, item.quantity - 1);
                                  }
                                }}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-r-md"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-medium">
                              {(item.price * item.quantity).toFixed(2)} ₽
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Подытог</span>
                    <span>{totalPrice().toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Плата за доставку</span>
                    <span>199 ₽</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-lg font-medium">
                    <span>Итого</span>
                    <span>{(totalPrice() + 199).toFixed(2)} ₽</span>
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center" 
                    onClick={() => setIsCheckingOut(true)}
                    disabled={isSubmitting}
                  >
                    Оформить заказ <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : isProcessingPayment ? (
              // Vue du paiement Stripe
              <div className="py-6 flex-1 flex flex-col">
                <h3 className="text-lg font-medium mb-4">Оплата банковской картой</h3>
                <StripePayment
                  amount={getFinalTotal()}
                  onSuccess={handleStripeSuccess}
                  onBack={handleStripeBack}
                  onError={handleStripeError}
                />
              </div>
            ) : (
              // Vue des informations de livraison
              <div className="py-6 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-lg font-medium mb-4">Информация о доставке</h3>
                  
                  {/* Message d'avertissement si non connecté */}
                  {!isAuthenticated && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                      ⚠️ Пожалуйста, войдите в аккаунт для оформления заказа
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* City Field */}
                    <div>
                      <Label htmlFor="city">Город *</Label>
                      <Input
                        id="city"
                        className="mt-1"
                        placeholder="Введите ваш город"
                        value={addressDetails.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Street Field */}
                    <div>
                      <Label htmlFor="street">Улица *</Label>
                      <Input
                        id="street"
                        className="mt-1"
                        placeholder="Введите название улицы"
                        value={addressDetails.street}
                        onChange={(e) => handleAddressChange("street", e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* House Number Field */}
                    <div>
                      <Label htmlFor="house">Номер дома *</Label>
                      <Input
                        id="house"
                        className="mt-1"
                        placeholder="Введите номер дома"
                        value={addressDetails.house}
                        onChange={(e) => handleAddressChange("house", e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entrance">Подъезд</Label>
                        <Input
                          id="entrance"
                          className="mt-1"
                          placeholder="Номер подъезда"
                          value={addressDetails.entrance}
                          onChange={(e) => handleAddressChange("entrance", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="apartment">Квартира</Label>
                        <Input
                          id="apartment"
                          className="mt-1"
                          placeholder="Номер квартиры"
                          value={addressDetails.apartment}
                          onChange={(e) => handleAddressChange("apartment", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Floor Field */}
                    <div>
                      <Label htmlFor="floor">Этаж</Label>
                      <Input
                        id="floor"
                        className="mt-1"
                        placeholder="Номер этажа"
                        value={addressDetails.floor}
                        onChange={(e) => handleAddressChange("floor", e.target.value)}
                      />
                    </div>
                    
                    {/* Comment Field */}
                    <div>
                      <Label htmlFor="comment">Инструкции по доставке</Label>
                      <Textarea
                        id="comment"
                        className="mt-1"
                        placeholder="Дополнительные инструкции по доставке (например, позвонить перед доставкой, оставить у двери)"
                        value={addressDetails.comment}
                        onChange={(e) => handleAddressChange("comment", e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    {/* Promo Code Field */}
                    <div>
                      <Label htmlFor="promoCode">Промокод</Label>
                      <Input
                        id="promoCode"
                        className="mt-1"
                        placeholder="Введите промокод, если он у вас есть"
                        value={addressDetails.promoCode}
                        onChange={(e) => handleAddressChange("promoCode", e.target.value)}
                      />
                      {addressDetails.promoCode.toLowerCase() === "welcome10" && (
                        <p className="text-green-600 text-sm mt-1">Скидка 10% будет применена!</p>
                      )}
                    </div>

                    {/* Payment Method Section */}
                    <div>
                      <Label className="block mb-2">Способ оплаты</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit-card"
                            checked={paymentMethod === "credit-card"}
                            onChange={() => setPaymentMethod("credit-card")}
                            className="h-4 w-4 text-primary"
                          />
                          <span>Банковская карта</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={() => setPaymentMethod("cash")}
                            className="h-4 w-4 text-primary"
                          />
                          <span>Наличные при доставке</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimation du temps de livraison - NOUVEAU BLOC */}
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">Время доставки</p>
                      {isCalculating ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          <span className="text-sm text-gray-500">Расчёт...</span>
                        </div>
                      ) : deliveryEstimate ? (
                        <div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-orange-600">
                              {deliveryEstimate.deliveryTime}
                            </span>
                            <span className="text-sm text-gray-500">
                              (~{deliveryEstimate.duration} мин)
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>📏 {deliveryEstimate.distance} км</span>
                            <span>🚴 Среднее время: 15 км/ч</span>
                            <span>🍳 Приготовление: 15-25 мин</span>
                          </div>
                        </div>
                      ) : addressError ? (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-red-400" />
                          <p className="text-sm text-red-500">{addressError}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">
                          📍 Введите город, улицу и номер дома для расчёта
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Товары ({totalItems()})</span>
                    <span>{totalPrice().toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Стоимость доставки</span>
                    <span>199 ₽</span>
                  </div>
                  {addressDetails.promoCode.toLowerCase() === "welcome10" && (
                    <div className="flex justify-between items-center mb-4 text-green-600">
                      <span>Скидка по промокоду (10%)</span>
                      <span>-{(totalPrice() * 0.1).toFixed(2)} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-6 text-lg font-medium">
                    <span>Итого</span>
                    <span>{getFinalTotal().toFixed(2)} ₽</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCheckingOut(false)}
                      disabled={isSubmitting}
                    >
                      Назад в корзину
                    </Button>
                    <Button 
                      onClick={handleCheckout}
                      disabled={isSubmitting || !isAuthenticated}
                    >
                      {isSubmitting ? "Обработка..." : "Оформить заказ"}
                    </Button>
                  </div>
                  {!isAuthenticated && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      * Необходимо войти в аккаунт для оформления заказа
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}