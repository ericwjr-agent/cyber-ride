'use client';

import { useState, useEffect } from 'react';
import { priceBreakdown, formatUSD, BUFFER_MINUTES } from '@/lib/pricing';
import { formatScheduleLabel } from '@/lib/trip';
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
        <div style={{ width: 48, height: 48, borderWidth: 4 }} className="spinner" />
        <p className="text-gray-400">Calculating your price & ETA…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-sm">{error}</div>
        <button onClick={onBack} className="btn-secondary w-full">← Try Again</button>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-6">
      {/* Trip confirmed */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <span className="text-lg mt-0.5">{trip.pickup.kind === 'airport' ? '✈️' : '📍'}</span>
          <div>
            <p className="text-xs text-gray-500 mb-1">Pickup</p>
            <p className="text-sm font-medium text-gray-200">{trip.pickup.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <span className="text-lg mt-0.5">{trip.destination.kind === 'airport' ? '✈️' : '📍'}</span>
          <div>
            <p className="text-xs text-gray-500 mb-1">Destination</p>
            <p className="text-sm font-medium text-gray-200">{trip.destination.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <span className="text-lg mt-0.5">🕐</span>
          <div>
            <p className="text-xs text-gray-500 mb-1">Pickup Time</p>
            <p className="text-sm font-medium text-gray-200">{formatScheduleLabel(trip.schedule)}</p>
          </div>
        </div>
      </div>

      {/* ETA (right-now rides only) + Distance */}
      <div className="grid grid-cols-2 gap-4">
        {trip.schedule.mode === 'now' ? (
          <div className="card text-center">
            <p className="text-4xl font-black text-brand-cyan mb-1">~{quote.etaMinutes}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">min ETA</p>
            <p className="text-xs text-gray-600 mt-1">incl. 20 min buffer</p>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-4xl font-black text-brand-cyan mb-1">~{quote.drivingMinutes}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">min drive</p>
          </div>
        )}
        <div className="card text-center">
          <p className="text-4xl font-black text-white mb-1">{quote.distanceMiles.toFixed(1)}</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest">miles</p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Price Breakdown</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Base fare</span>
            <span>{formatUSD(quote.breakdown.base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">
              Mileage ({quote.distanceMiles.toFixed(1)} mi × $4.00/mi)
            </span>
            <span>{formatUSD(quote.breakdown.mileageFee)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-700 text-lg font-bold">
            <span>Total</span>
            <span className="text-white">{formatUSD(quote.priceCents)}</span>
          </div>
          <div className="flex justify-between text-brand-cyan text-xs pt-2">
            <span>⚡ Full payment required to book</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button onClick={() => onNext(quote)} className="btn-primary flex-1">Continue to Book</button>
      </div>
    </div>
  );
}
