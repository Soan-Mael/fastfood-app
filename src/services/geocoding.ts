// src/services/geocoding.ts

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DeliveryEstimate {
  distance: number;
  duration: number;
  deliveryTime: string;
}

// Coordonnées du restaurant (exemple pour Pizza Italiano)
const RESTAURANT_COORDS: Coordinates = {
  lat: 55.7558,
  lng: 37.6176
};

// Convertir une adresse en coordonnées GPS
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address || address.length < 10) {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
};

// Calculer la distance entre deux points
const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Calculer le temps de livraison
const calculateDeliveryTime = (distance: number): DeliveryEstimate => {
  const travelTimeMinutes = (distance / 15) * 60;
  const preparationTime = Math.floor(Math.random() * 10) + 15;
  const totalMinutes = Math.ceil(preparationTime + travelTimeMinutes);

  const now = new Date();
  const deliveryDate = new Date(now.getTime() + totalMinutes * 60000);
  const deliveryTimeStr = deliveryDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    distance: Math.round(distance * 10) / 10,
    duration: totalMinutes,
    deliveryTime: deliveryTimeStr
  };
};

// Méthode principale
export const getDeliveryEstimate = async (address: string): Promise<DeliveryEstimate | null> => {
  if (!address || address.length < 10) {
    return null;
  }

  const coords = await geocodeAddress(address);
  if (coords) {
    const distance = calculateDistance(RESTAURANT_COORDS, coords);
    return calculateDeliveryTime(distance);
  }
  return null;
};