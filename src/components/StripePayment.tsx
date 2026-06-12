// src/components/StripePayment.tsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/api';
import { CreditCard, Lock, Shield, Smartphone } from 'lucide-react';

// Clé publique Stripe (Mode Test)
const stripePromise = loadStripe('pk_test_51TeXNUCE3ladyrhSMviVPejeImTdFTjQDehskkKKrBdcOaFgNFu7tWc0CqZVHRPRzsfNNGMKaEldbwqQp8cbTwwL00ZxmvwMp5');

interface StripePaymentProps {
  amount: number;
  orderId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ amount, orderId, onSuccess, onBack, onError }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Créer le PaymentIntent au chargement du composant
    const createIntent = async () => {
      setIsLoading(true);
      try {
        const response = await paymentService.createPaymentIntent(amount, 'rub', {
          orderId: orderId || 'unknown',
          timestamp: new Date().toISOString(),
        });
        setClientSecret(response.data.clientSecret);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Erreur d\'initialisation du paiement';
        onError(errorMessage);
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (amount > 0) {
      createIntent();
    }
  }, [amount, orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast({
        title: 'Erreur',
        description: 'Le système de paiement n\'est pas prêt',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName || !customerEmail) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir votre nom et votre email',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: customerName,
          email: customerEmail,
        },
      },
    });

    if (error) {
      onError(error.message || 'Une erreur est survenue');
      toast({
        title: 'Erreur de paiement',
        description: error.message,
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: '✅ Paiement réussi !',
        description: 'Votre commande a été confirmée',
      });
      onSuccess(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Initialisation du paiement...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Оплата</h2>
        <p className="text-gray-500">Сумма к оплате: <span className="font-bold text-orange-500">{amount} ₽</span></p>
      </div>
      
      <div className="space-y-4">
        {/* Informations client */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Информация о плательщике</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Имя и фамилия *</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="Иван Иванов"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Электронная почта *</label>
              <input
                type="email"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="ivan@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Carte bancaire */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">Информация о карте</h3>
          </div>
          <div className="border rounded-lg bg-white p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Données cryptées</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              <span>3D Secure</span>
            </div>
          </div>
        </div>

        {/* Cartes acceptées */}
        <div className="flex justify-center gap-2">
          <img src="https://cdn.jsdelivr.net/gh/amcharts/amcharts4@4.10.24/dist/images/visa.png" alt="Visa" className="h-6" />
          <img src="https://cdn.jsdelivr.net/gh/amcharts/amcharts4@4.10.24/dist/images/mastercard.png" alt="Mastercard" className="h-6" />
          <img src="https://cdn.jsdelivr.net/gh/amcharts/amcharts4@4.10.24/dist/images/amex.png" alt="American Express" className="h-6" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isProcessing}
          >
            Назад
          </Button>
          <Button 
            type="submit" 
            disabled={!stripe || !clientSecret || isProcessing}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Обработка...
              </>
            ) : (
              `Оплатить ${amount} ₽`
            )}
          </Button>
        </div>

        {/* Mode test - à enlever en production */}
        <div className="text-center text-xs text-gray-400 border-t pt-4 mt-2">
          <p>🔐 Paiement sécurisé par Stripe</p>
          <p className="mt-1">Cartes de test : 4242 4242 4242 4242 | 12/28 | 123</p>
        </div>
      </div>
    </form>
  );
}

// Composant principal
export function StripePayment(props: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}