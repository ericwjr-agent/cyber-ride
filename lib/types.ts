import type { TerminalType } from './airport';
import type { EndpointKind, ScheduleMode } from './trip';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

/** A trip endpoint — either the airport (with a terminal) or a free-text address. */
export interface EndpointData {
  kind: EndpointKind;
  address: string;
  lat: number;
  lng: number;
  terminal?: TerminalType;
}

export interface ScheduleData {
  mode: ScheduleMode;
  /** ISO-ish datetime-local string; only present when mode === 'scheduled'. */
  dateTime?: string;
}

/** Trip details collected in the first booking step. */
export interface TripData {
  pickup: EndpointData;
  destination: EndpointData;
  schedule: ScheduleData;
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
}

export type BookingStep = 'trip' | 'quote' | 'contact' | 'payment' | 'confirmed';
