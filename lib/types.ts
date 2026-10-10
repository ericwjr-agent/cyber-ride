export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

export interface QuoteData {
  distanceMiles: number;
  drivingMinutes: number;
  etaMinutes: number;
  priceCents: number;
  breakdown: {
    base: number;
    mileageFee: number;
  };
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  flightNumber: string;
  pickupTime: string;
}

export type BookingStep = 'location' | 'quote' | 'contact' | 'payment' | 'confirmed';
