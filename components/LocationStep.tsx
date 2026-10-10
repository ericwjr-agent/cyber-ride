'use client';

import { useState, useRef, useEffect } from 'react';
import type { LocationData } from '@/lib/types';
import { geolocateUser } from '@/lib/geolocation';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface Props {
  onNext: (location: LocationData) => void;
}

// Airport origin: Hartsfield-Jackson Atlanta International Airport
const AIRPORT_ADDRESS = 'Hartsfield-Jackson Atlanta International Airport, Atlanta, GA 30320';

export default function LocationStep({ onNext }: Props) {
  const [address,   setAddress]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [geoError,  setGeoError]  = useState('');
  const [mapsReady, setMapsReady] = useState(false);
  const inputRef     = useRef<HTMLInputElement>(null);
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  const latRef       = useRef<number>(0);
  const lngRef       = useRef<number>(0);

  // Load Google Maps JS API once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (typeof window === 'undefined') return;
    if (window.google?.maps) { setMapsReady(true); return; }
    if (document.getElementById('google-maps-script')) return;

    window.initGoogleMaps = () => setMapsReady(true);
    const script = document.createElement('script');
    script.id    = 'google-maps-script';
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.onerror = () => setGeoError('Could not load Google Maps. Please enter your address manually.');
    document.head.appendChild(script);
  }, []);

  // Attach Places Autocomplete
  // Wrapped defensively: if the Maps API key is rejected (e.g. referrer
  // restrictions misconfigured for this domain), Google's SDK throws
  // synchronously here. Without the try/catch, that uncaught exception
  // crashes the whole page to Next.js's error boundary — even though
  // manual address entry would otherwise still work fine.
  useEffect(() => {
    if (!mapsReady || !inputRef.current || !window.google?.maps?.places) return;
    try {
      autocomplete.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry'],
      });
      autocomplete.current.addListener('place_changed', () => {
        const place = autocomplete.current?.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
        if (place?.geometry?.location) {
          latRef.current = place.geometry.location.lat();
          lngRef.current = place.geometry.location.lng();
        }
      });
    } catch (err) {
      // Autocomplete unavailable (e.g. blocked API key) — fall back to
      // plain manual text entry, which still works via handleSubmit.
      setGeoError('Address autocomplete is unavailable right now. You can still type your address manually.');
    }
  }, [mapsReady]);

  // Use device location → reverse geocode via Maps JS Geocoder
  const handleGeolocate = async () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.');
      return;
    }
    setLoading(true);
    try {
      const geocoder = window.google?.maps
        ? new window.google.maps.Geocoder()
        : undefined;

      const result = await geolocateUser(
        (success, error) => navigator.geolocation.getCurrentPosition(success, error),
        geocoder as any,
      );

      latRef.current = result.coords.lat;
      lngRef.current = result.coords.lng;
      setAddress(result.address);
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Could not get your location. Please enter your address manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    onNext({ address: address.trim(), lat: latRef.current, lng: lngRef.current });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Your destination address</label>
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Where are you going? (home, hotel, etc.)"
          className="input-brand"
          required
        />
        <p className="text-xs text-gray-600 mt-2">
          We&apos;ll calculate distance from {AIRPORT_ADDRESS.split(',')[0]} to your destination.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGeolocate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-gray-700 text-gray-300
                   hover:border-brand-cyan hover:text-brand-cyan py-3 rounded-xl transition-all text-sm font-medium"
      >
        {loading ? <span className="spinner" /> : <span>📍</span>}
        {loading ? 'Getting your location…' : 'Use My Current Location'}
      </button>

      {geoError && <p className="text-red-400 text-sm">{geoError}</p>}

      <button
        type="submit"
        disabled={!address.trim() || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Get My Quote
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}