'use client';

import { useState, useEffect } from 'react';
import { priceBreakdown, formatUSD, BUFFER_MINUTES } from '@/lib/pricing';
import { formatScheduleLabel } from '@/lib/trip';
import { IconLocation, IconClock, IconArrow } from '@/components/icons';
import type { TripData, QuoteData } from '@/lib/types';

interface Props {
  trip: TripData;
  onNext: (quote: QuoteData) => void;
  onBack: () => void;
}

export default function QuoteStep({ trip, onNext, onBack }: Props) {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          calculate();
        }
      }, 200);
      return () => clearInterval(interval);
    }
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  async function calculate() {
    setLoading(true);
    setError('');

    const originLatLng = trip.pickup.lat && trip.pickup.lng
      ? new window.google.maps.LatLng(trip.pickup.lat, trip.pickup.lng)
      : trip.pickup.address;
    const destLatLng = trip.destination.lat && trip.destination.lng
      ? new window.google.maps.LatLng(trip.destination.lat, trip.destination.lng)
      : trip.destination.address;

    const service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [originLatLng],
        destinations: [destLatLng],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        if (status !== 'OK' || !response) {
          setError('Could not calculate distance. Please check your addresses and try again.');
          setLoading(false);
          return;
        }

        const element = response.rows[0]?.elements[0];

        if (!element || element.status !== 'OK') {
          setError('Route not reachable by road. Please enter different addresses.');
          setLoading(false);
          return;
        }

        const distanceMiles = element.distance.value * 0.000621371;
        const drivingMinutes = Math.ceil(element.duration.value / 60);
        const etaMinutes = drivingMinutes + BUFFER_MINUTES;

        const bd = priceBreakdown(distanceMiles);

        setQuote({
          distanceMiles: Math.round(distanceMiles * 10) / 10,
          drivingMinutes,
          etaMinutes,
          priceCents: bd.total,
          breakdown: { base: bd.base, mileageFee: bd.mileageFee },
        });
        setLoading(false);
      },
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div style={{ width: 40, height: 40, borderWidth: 3 }} className="spinner" />
        <p className="text-gray-500 text-sm">Calculating your price & ETA…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 text-sm">{error}</div>
        <button onClick={onBack} className="btn-secondary w-full">← Try Again</button>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Trip confirmed */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-brand-surface rounded-xl border border-brand-border">
          <IconLocation className="w-5 h-5 text-brand-gold/60 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-widest">Pickup</p>
            <p className="text-sm font-medium text-gray-300">{trip.pickup.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-brand-surface rounded-xl border border-brand-border">
          <IconLocation className="w-5 h-5 text-brand-gold/60 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-widest">Destination</p>
            <p className="text-sm font-medium text-gray-300">{trip.destination.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-brand-surface rounded-xl border border-brand-border">
          <IconClock className="w-5 h-5 text-brand-gold/60 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-widest">Pickup Time</p>
            <p className="text-sm font-medium text-gray-300">{formatScheduleLabel(trip.schedule)}</p>
          </div>
        </div>
      </div>

      {/* ETA + Distance */}
      <div className="grid grid-cols-2 gap-4">
        {trip.schedule.mode === 'now' ? (
          <div className="card text-center">
            <p className="text-3xl font-semibold text-brand-gold mb-1 font-display">~{quote.etaMinutes}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">min ETA</p>
            <p className="text-xs text-gray-700 mt-1">incl. 20 min buffer</p>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-3xl font-semibold text-brand-gold mb-1 font-display">~{quote.drivingMinutes}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">min drive</p>
          </div>
        )}
        <div className="card text-center">
          <p className="text-3xl font-semibold text-white mb-1 font-display">{quote.distanceMiles.toFixed(1)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest">miles</p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-4">Price Breakdown</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Base fare</span>
            <span className="text-white">{formatUSD(quote.breakdown.base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              Mileage ({quote.distanceMiles.toFixed(1)} mi × $4.00/mi)
            </span>
            <span className="text-white">{formatUSD(quote.breakdown.mileageFee)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-brand-border text-lg font-medium">
            <span className="text-white">Total</span>
            <span className="text-white">{formatUSD(quote.priceCents)}</span>
          </div>
          <div className="flex justify-between text-brand-gold text-xs pt-1">
            <span>Full payment required to book</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button onClick={() => onNext(quote)} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Continue <IconArrow className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
