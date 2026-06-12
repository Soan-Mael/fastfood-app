// src/components/DeliveryMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DeliveryMapProps {
  restaurantLat: number;
  restaurantLng: number;
  deliveryLat: number;
  deliveryLng: number;
  courierLat?: number;
  courierLng?: number;
  status: string;
}

// Composant pour centrer la carte
function SetViewOnChange({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export function DeliveryMap({ 
  restaurantLat, 
  restaurantLng, 
  deliveryLat, 
  deliveryLng, 
  courierLat, 
  courierLng, 
  status 
}: DeliveryMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
        }
      );
    }
  }, []);

  // Calculer la position du livreur (entre restaurant et client selon le statut)
  const getCourierPosition = (): [number, number] => {
    if (courierLat && courierLng) {
      return [courierLat, courierLng];
    }
    
    // Simulation de la position du livreur selon le statut
    const progress = {
      confirmed: 0.1,
      preparing: 0.2,
      picked_up: 0.4,
      on_the_way: 0.7,
      delivered: 1,
    }[status] || 0.1;
    
    const lat = restaurantLat + (deliveryLat - restaurantLat) * progress;
    const lng = restaurantLng + (deliveryLng - restaurantLng) * progress;
    return [lat, lng];
  };

  const courierPosition = getCourierPosition();
  const center: [number, number] = [
    (restaurantLat + deliveryLat) / 2,
    (restaurantLng + deliveryLng) / 2,
  ];

  // Calculer le temps estimé
  useEffect(() => {
    const distance = calculateDistance(courierPosition[0], courierPosition[1], deliveryLat, deliveryLng);
    const timeMin = Math.round(distance * 2); // ~2 minutes par km
    if (status === 'delivered') {
      setEstimatedTime('Livrée !');
    } else if (status === 'on_the_way') {
      setEstimatedTime(`~${timeMin} min`);
    } else if (status === 'picked_up') {
      setEstimatedTime('Le livreur vient de partir');
    } else {
      setEstimatedTime('Préparation en cours');
    }
  }, [courierPosition, deliveryLat, deliveryLng, status]);

  // Calcul de distance entre deux points (formule Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="space-y-4">
      {/* Informations de suivi */}
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Statut de la livraison</p>
            <p className="font-semibold text-orange-600">
              {status === 'confirmed' && 'Commande confirmée'}
              {status === 'preparing' && 'Préparation en cours'}
              {status === 'picked_up' && 'Commande prise en charge'}
              {status === 'on_the_way' && 'En route vers vous'}
              {status === 'delivered' && 'Livrée !'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Temps estimé</p>
            <p className="font-semibold">{estimatedTime}</p>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500 rounded-full"
              style={{ 
                width: `${
                  status === 'confirmed' ? 10 :
                  status === 'preparing' ? 25 :
                  status === 'picked_up' ? 45 :
                  status === 'on_the_way' ? 70 :
                  status === 'delivered' ? 100 : 0
                }%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="h-96 rounded-lg overflow-hidden border shadow-lg">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <SetViewOnChange center={center} />
          
          {/* Fond de carte */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Restaurant (départ) */}
          <Marker position={[restaurantLat, restaurantLng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">🍕 Restaurant</p>
                <p className="text-sm text-gray-500">Point de départ</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Livraison (arrivée) */}
          <Marker position={[deliveryLat, deliveryLng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">🏠 Livraison</p>
                <p className="text-sm text-gray-500">Votre adresse</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Livreur (position actuelle) */}
          {status !== 'delivered' && (
            <Marker position={courierPosition} icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">🛵 Livreur</p>
                  <p className="text-sm text-gray-500">Position actuelle</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Position de l'utilisateur */}
          {userLocation && (
            <Marker position={userLocation} icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">📍 Vous êtes ici</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Ligne du trajet */}
          <Polyline 
            positions={[[restaurantLat, restaurantLng], courierPosition, [deliveryLat, deliveryLng]]}
            color="#f97316"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        </MapContainer>
      </div>
      
      {/* Légende */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Restaurant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Livreur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Livraison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span>Trajet</span>
        </div>
      </div>
    </div>
  );
}