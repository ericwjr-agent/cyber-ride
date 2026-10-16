'use client';

import { useState } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import TripStep     from './TripStep';
import QuoteStep    from './QuoteStep';
import ContactStep  from './ContactStep';
import PaymentStep  from './PaymentStep';
import { formatScheduleLabel } from '@/lib/trip';
import { formatUSD } from '@/lib/pricing';
import { IconBolt, IconCheck, IconPhone } from '@/components/icons';
import type { BookingStep, TripData, QuoteData, ContactInfo } from '@/lib/types';

const STEPS: { key: BookingStep; label: string }[] = [
  { key: 'trip',       label: 'Trip'          },
  { key: 'quote',      label: 'Quote'         },
  { key: 'contact',    label: 'Contact'       },
  { key: 'payment',    label: 'Payment'       },
  { key: 'confirmed',  label: 'Confirmed'     },
];

export default function BookingFlow() {
  const [step,    setStep]    = useState<BookingStep>('trip');
  const [trip,    setTrip]    = useState<TripData | null>(null);
  const [quote,   setQuote]   = useState<QuoteData | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div>
      {/* Step indicator */}
      {step !== 'confirmed' && (
        <div className="flex items-center mb-10">
          {STEPS.filter((s) => s.key !== 'confirmed').map((s, i) => {
            const idx  = STEPS.findIndex((x) => x.key === s.key);
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    ${active ? 'step-active' : done ? 'step-done' : 'step-pending'}`}>
                    {done ? <IconCheck className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block uppercase tracking-widest
                    ${active ? 'text-brand-gold' : done ? 'text-green-400/70' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.filter((s) => s.key !== 'confirmed').length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${idx < currentIdx ? 'bg-green-500/30' : 'bg-brand-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Steps */}
      {step === 'trip' && (
        <TripStep
          initial={trip ?? undefined}
          onNext={(t) => { setTrip(t); setStep('quote'); }}
        />
      )}
      {step === 'quote' && trip && (
        <QuoteStep
          trip={trip}
          onNext={(q) => { setQuote(q); setStep('contact'); }}
          onBack={() => setStep('trip')}
        />
      )}
      {step === 'contact' && quote && (
        <ContactStep
          quote={quote}
          onNext={(c) => { setContact(c); setStep('payment'); }}
          onBack={() => setStep('quote')}
        />
      )}
      {step === 'payment' && trip && quote && contact && (
        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? 'test',
          currency: 'USD',
          intent: 'capture',
        }}>
          <PaymentStep
            trip={trip}
            quote={quote}
            contact={contact}
            onSuccess={() => setStep('confirmed')}
            onBack={() => setStep('contact')}
          />
        </PayPalScriptProvider>
      )}
      {step === 'confirmed' && trip && quote && contact && (
        <ConfirmedView trip={trip} quote={quote} contact={contact} />
      )}
    </div>
  );
}

function ConfirmedView({
  trip, quote, contact
}: { trip: TripData; quote: QuoteData; contact: ContactInfo }) {
  return (
    <div className="text-center py-8 animate-fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                      bg-brand-gold/10 border border-brand-gold/20 mb-6">
        <IconCheck className="w-8 h-8 text-brand-gold" />
      </div>
      <h2 className="font-display text-3xl font-medium text-brand-gold mb-3">You&#39;re booked</h2>
      <p className="text-gray-400 text-lg mb-8 font-light">
        Your Cybertruck ride is confirmed.
      </p>

      <div className="card text-left mb-6">
        <h3 className="font-medium mb-4 text-gray-500 uppercase text-xs tracking-[0.2em]">Booking Summary</h3>
        <div className="space-y-3 text-sm">
          <Row label="Pickup"        value={trip.pickup.address} />
          <Row label="Destination"   value={trip.destination.address} />
          <Row label="Pickup Time"   value={formatScheduleLabel(trip.schedule)} />
          {contact.flightNumber && <Row label="Flight" value={contact.flightNumber} />}
          <Row label="ETA"           value={`~${quote.etaMinutes} minutes`} />
          <Row label="Total Paid"    value={formatUSD(quote.priceCents)} className="text-brand-gold" />
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 text-sm text-left">
        <p className="font-medium mb-1 text-gray-300">What happens next</p>
        <p className="text-gray-500 leading-relaxed">
          Your driver will text you at <span className="text-white">{contact.phone}</span> with their real-time location before pickup.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  );
}
