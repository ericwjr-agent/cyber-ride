'use client';

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { formatUSD } from '@/lib/pricing';
import { formatScheduleLabel } from '@/lib/trip';
import type { TripData, QuoteData, ContactInfo } from '@/lib/types';

interface Props {
  trip:      TripData;
  quote:     QuoteData;
  contact:   ContactInfo;
  onSuccess: () => void;
  onBack:    () => void;
}

export default function PaymentStep({ trip, quote, contact, onSuccess, onBack }: Props) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [error,      setError]      = useState('');
  const [processing, setProcessing] = useState(false);

  const scheduleLabel = formatScheduleLabel(trip.schedule);

  /** Capture the FULL amount immediately — full payment at booking */
  const createOrder = async (): Promise<string> => {
    const res = await fetch('/api/orders/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:      (quote.priceCents / 100).toFixed(2),
        description: `Cyber Ride — ${trip.pickup.address} to ${trip.destination.address} (${formatUSD(quote.priceCents)})`,
        intent:      'CAPTURE',
      }),
    });
    const data = await res.json();
    if (!data.id) throw new Error(data.error ?? 'Failed to create order');
    return data.id;
  };

  const onApprove = async (data: { orderID: string }, _actions: unknown) => {
    setProcessing(true);
    setError('');
    try {
      // Capture the full payment immediately
      const res = await fetch(`/api/orders/${data.orderID}/capture/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error ?? 'Payment capture failed');

      // Send confirmation emails (await so errors surface)
      try {
        const emailRes = await fetch('/api/bookings/notify/', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName:    contact.name,
            customerEmail:   contact.email,
            customerPhone:   contact.phone,
            flightNumber:    contact.flightNumber,
            pickupAddress:   trip.pickup.address,
            destinationAddress: trip.destination.address,
            scheduleLabel,
            etaMinutes:      quote.etaMinutes,
            distanceMiles:   quote.distanceMiles,
            totalCents:      quote.priceCents,
          }),
        });
        if (!emailRes.ok) {
          const emailErr = await emailRes.json().catch(() => ({}));
          console.error('Booking email send failed:', emailErr);
        }
      } catch (emailError) {
        console.error('Booking email fetch error:', emailError);
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Order summary */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Pickup</span>
            <span className="text-right text-gray-300">{trip.pickup.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Destination</span>
            <span className="text-right text-gray-300">{trip.destination.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pickup Time</span>
            <span className="text-gray-300">{scheduleLabel}</span>
          </div>
          {contact.flightNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Flight</span>
              <span className="text-gray-300">{contact.flightNumber}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-brand-border text-lg font-medium">
            <span className="text-white">Total</span>
            <span className="text-brand-gold">{formatUSD(quote.priceCents)}</span>
          </div>
        </div>
        <div className="space-y-1 text-xs text-gray-600 border-t border-brand-border pt-3">
          <p><span className="text-gray-500">Name:</span> {contact.name}</p>
          <p><span className="text-gray-500">Phone:</span> {contact.phone}</p>
          <p><span className="text-gray-500">Email:</span> {contact.email}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {processing ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p className="text-gray-500 text-sm">Processing your payment…</p>
        </div>
      ) : (
        <>
          {isPending && (
            <div className="flex items-center justify-center gap-3 py-4 text-gray-500 text-sm">
              <div className="spinner" />
              Loading payment…
            </div>
          )}
          <div className={isPending ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
            <PayPalButtons
              style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' }}
              createOrder={createOrder}
              onApprove={onApprove}
              onCancel={() => setError('Payment cancelled. Click the button above to try again.')}
              onError={() => setError('PayPal encountered an error. Please try again.')}
            />
          </div>
        </>
      )}

      <p className="text-xs text-center text-gray-600">
        Secured by PayPal. Full payment of {formatUSD(quote.priceCents)} is charged now to confirm your booking.
      </p>

      {!processing && (
        <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-400 transition-colors w-full text-center">
          ← Go back
        </button>
      )}
    </div>
  );
}
