'use client';

import { useState, useEffect } from 'react';
import type { TripData, EndpointData, ScheduleData } from '@/lib/types';
import { validateTripEndpoints, validateSchedule } from '@/lib/trip';
import { AIRPORT_TERMINALS } from '@/lib/airport';
import EndpointPicker from './EndpointPicker';
import SchedulePicker from './SchedulePicker';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface Props {
  onNext: (trip: TripData) => void;
  initial?: TripData;
}

const emptyAirport = (): EndpointData => ({ kind: 'airport', address: '', lat: 0, lng: 0, terminal: 'domestic' });
const emptyAddress = (): EndpointData => ({ kind: 'address', address: '', lat: 0, lng: 0 });

export default function TripStep({ onNext, initial }: Props) {
  const [pickup, setPickup] = useState<EndpointData>(initial?.pickup ?? emptyAirport());
  const [destination, setDestination] = useState<EndpointData>(initial?.destination ?? emptyAddress());
  const [schedule, setSchedule] = useState<ScheduleData>(initial?.schedule ?? { mode: 'now' });
  const [mapsReady, setMapsReady] = useState(false);
  const [error, setError] = useState('');

  // Load Google Maps JS API once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (typeof window === 'undefined') return;
    if (window.google?.maps) { setMapsReady(true); return; }
    if (document.getElementById('google-maps-script')) return;

    window.initGoogleMaps = () => setMapsReady(true);
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.onerror = () => setError('Could not load Google Maps. You can still enter addresses manually.');
    document.head.appendChild(script);
  }, []);

  const resolveEndpointForSubmit = (endpoint: EndpointData): EndpointData => {
    if (endpoint.kind === 'airport' && endpoint.terminal) {
      return { ...endpoint, address: AIRPORT_TERMINALS[endpoint.terminal].address };
    }
    return endpoint;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const resolvedPickup = resolveEndpointForSubmit(pickup);
    const resolvedDestination = resolveEndpointForSubmit(destination);

    const endpointCheck = validateTripEndpoints(resolvedPickup, resolvedDestination);
    if (!endpointCheck.valid) {
      setError(endpointCheck.error ?? 'Please check your trip details.');
      return;
    }

    const scheduleCheck = validateSchedule(schedule);
    if (!scheduleCheck.valid) {
      setError(scheduleCheck.error ?? 'Please check your pickup time.');
      return;
    }

    onNext({ pickup: resolvedPickup, destination: resolvedDestination, schedule });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <EndpointPicker
        label="Pickup Location"
        value={pickup}
        onChange={setPickup}
        mapsReady={mapsReady}
        allowCurrentLocation
      />

      <EndpointPicker
        label="Destination"
        value={destination}
        onChange={setDestination}
        mapsReady={mapsReady}
        allowCurrentLocation
      />

      <SchedulePicker value={schedule} onChange={setSchedule} />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
        Get My Quote
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
