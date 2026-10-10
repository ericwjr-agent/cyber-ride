'use client';

import Link from 'next/link';
import { formatUSD, BASE_PRICE_CENTS, PER_MILE_CENTS } from '@/lib/pricing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4
                      bg-brand-dark/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div className="brand-wordmark text-base leading-none flex flex-col items-start">
            <span>CYBER</span>
            <span className="text-brand-cyan">RIDE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/book" className="btn-primary text-sm py-2 px-5 whitespace-nowrap text-center">
            Book a Ride
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-start md:justify-center
                          px-6 pt-24 md:pt-20 pb-20 bg-grid">

        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                        bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-cyan/10 border border-brand-cyan/30
                          rounded-full px-4 py-1.5 text-brand-cyan text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse-slow" />
            Airport Rides in a Cybertruck
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Skip the rental counter.<br />
            <span className="text-brand-cyan glow-cyan-text">Ride in a Cybertruck.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Premium airport pickup powered by Tesla Cybertruck.
            Transparent pricing. Book in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 mb-16">
            <Link href="/book"
                  className="btn-primary text-lg py-5 px-10 glow-cyan flex items-center gap-3">
              <span>⚡</span>
              Book Your Ride
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { label: 'Starting At',  value: formatUSD(BASE_PRICE_CENTS) },
              { label: 'Per Mile',     value: `$${PER_MILE_CENTS / 100}` },
              { label: 'Service',      value: 'ATL Airport' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-brand-cyan">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center justify-center gap-2 mt-10
                     text-gray-600 hover:text-gray-400 text-sm animate-bounce transition-colors cursor-pointer">
          <span>Learn more</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Booked in minutes. Picked up in style.</p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '📍', step: '01', title: 'Enter Destination', desc: 'Type your destination address. We calculate distance and price instantly.' },
              { icon: '✈️', step: '02', title: 'Flight Details', desc: 'Share your flight number and pickup time so we track your arrival.' },
              { icon: '💳', step: '03', title: 'Pay & Book', desc: 'Pay the full fare upfront via PayPal. No surprises, no hidden fees.' },
              { icon: '🚗', step: '04', title: 'Ride in Style', desc: 'Your Cybertruck driver picks you up at the airport and texts you their location.' },
            ].map((item) => (
              <div key={item.step} className="card hover:border-brand-cyan/40 transition-colors group">
                <div className="text-3xl mb-4">{item.icon}</div>
                <p className="text-brand-cyan font-mono text-sm mb-2">{item.step}</p>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-400 mb-12 text-lg">Flat base rate plus mileage. No surge pricing.</p>

          <div className="card max-w-md mx-auto text-left">
            <h3 className="font-bold text-lg mb-4 text-brand-cyan">Rate</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex justify-between items-center">
                <span>Base fare (minimum)</span>
                <span className="font-bold text-white">{formatUSD(BASE_PRICE_CENTS)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Per mile from airport</span>
                <span className="font-bold text-white">${PER_MILE_CENTS / 100}/mi</span>
              </li>
              <li className="flex justify-between items-center pt-3 border-t border-gray-700 text-gray-400 text-xs">
                <span>Example: 15-mile ride</span>
                <span>{formatUSD(BASE_PRICE_CENTS + 15 * PER_MILE_CENTS)}</span>
              </li>
              <li className="flex justify-between items-center text-gray-400 text-xs">
                <span>Example: 30-mile ride</span>
                <span>{formatUSD(BASE_PRICE_CENTS + 30 * PER_MILE_CENTS)}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <span className="brand-wordmark text-sm text-white">CYBER RIDE</span>
        </div>
        <p>Airport Rides · Atlanta Metro Area</p>
        <p className="mt-2 text-gray-600">© {new Date().getFullYear()} Cyber Ride. All rights reserved.</p>
      </footer>
    </div>
  );
}
