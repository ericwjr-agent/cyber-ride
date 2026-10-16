'use client';

import { useRef, useEffect, useState } from 'react';
import type { EndpointData } from '@/lib/types';
import type { TerminalType } from '@/lib/airport';
import { AIRPORT_TERMINALS } from '@/lib/airport';
import { geolocateUser } from '@/lib/geolocation';
import { IconPlane, IconLocation } from '@/components/icons';

interface Props {
  label: string;
  value: EndpointData;
  onChange: (value: EndpointData) => void;
  mapsReady: boolean;
  allowCurrentLocation?: boolean;
}

/**
 * Pickup/destination endpoint picker. Lets the user choose "Airport"
 * (with a domestic/international terminal toggle) or type a free-text
 * address with Google Places autocomplete + optional "use my location".
 */
export default function EndpointPicker({ label, value, onChange, mapsReady, allowCurrentLocation }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (value.kind !== 'address' || !mapsReady || !inputRef.current || !window.google?.maps?.places) return;
    try {
      autocomplete.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry'],
      });
      autocomplete.current.addListener('place_changed', () => {
        const place = autocomplete.current?.getPlace();
        const lat = place?.geometry?.location?.lat() ?? 0;
        const lng = place?.geometry?.location?.lng() ?? 0;
        onChange({
          kind: 'address',
          address: place?.formatted_address ?? value.address,
          lat,
          lng,
        });
      });
    } catch {
      setGeoError('Address autocomplete is unavailable right now. You can still type your address manually.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, value.kind]);

  const handleGeolocate = async () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    try {
      const geocoder = window.google?.maps ? new window.google.maps.Geocoder() : undefined;
      const result = await geolocateUser(
        (success, error) => navigator.geolocation.getCurrentPosition(success, error),
        geocoder as any,
      );
      onChange({ kind: 'address', address: result.address, lat: result.coords.lat, lng: result.coords.lng });
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Could not get your location. Please enter your address manually.');
    } finally {
      setGeoLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-400">{label}</label>

      {/* Airport / Address toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ kind: 'airport', address: '', lat: 0, lng: 0, terminal: value.terminal ?? 'domestic' })}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
            value.kind === 'airport'
              ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
              : 'border-brand-border text-gray-500 hover:border-brand-gold/20 hover:text-gray-300'
          }`}
        >
          <IconPlane className="w-4 h-4" />
          Airport (ATL)
        </button>
        <button
          type="button"
          onClick={() => onChange({ kind: 'address', address: '', lat: 0, lng: 0 })}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
            value.kind === 'address'
              ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
              : 'border-brand-border text-gray-500 hover:border-brand-gold/20 hover:text-gray-300'
          }`}
        >
          <IconLocation className="w-4 h-4" />
          Other Address
        </button>
      </div>

      {value.kind === 'airport' ? (
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(AIRPORT_TERMINALS) as TerminalType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...value, kind: 'airport', terminal: t })}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-all duration-300 text-left ${
                value.terminal === t
                  ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
                  : 'border-brand-border text-gray-500 hover:border-brand-gold/20 hover:text-gray-300'
              }`}
            >
              {AIRPORT_TERMINALS[t].shortLabel} Terminal
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={value.address}
            onChange={(e) => onChange({ ...value, kind: 'address', address: e.target.value })}
            placeholder="Enter an address"
            className="input-brand"
          />
          {allowCurrentLocation && (
            <button
              type="button"
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 border border-brand-border text-gray-400
                         hover:border-brand-gold/30 hover:text-brand-gold py-2.5 rounded-lg
                         transition-all duration-300 text-xs font-medium"
            >
              {geoLoading ? <span className="spinner" /> : <IconLocation className="w-3.5 h-3.5" />}
              {geoLoading ? 'Getting your location…' : 'Use My Current Location'}
            </button>
          )}
          {geoError && <p className="text-red-400 text-xs">{geoError}</p>}
        </div>
      )}
    </div>
  );
}
