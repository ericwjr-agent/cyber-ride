'use client';

import Link from 'next/link';
import { formatUSD, BASE_PRICE_CENTS, PER_MILE_CENTS } from '@/lib/pricing';
import {
  IconLuggage, IconSeat, IconScreen, IconCar, IconArrow, IconChevronDown,
  IconPhone, IconMail, IconCybertruck, IconLocation, IconClock, IconCard,
} from '@/components/icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5
                      bg-brand-dark/90 backdrop-blur-md border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          <IconCybertruck className="w-6 h-5 text-brand-gold" />
          <div className="brand-wordmark text-sm leading-none flex flex-col items-start">
            <span className="text-white">CYBER</span>
            <span className="text-brand-gold mt-0.5">RIDE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/book" className="btn-primary text-sm py-2.5 px-6 whitespace-nowrap text-center">
            Book a Ride
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center
                          px-6 pt-24 pb-20">

        {/* Subtle radial gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none
                        bg-[radial-gradient(ellipse_at_center_top,rgba(197,165,114,0.06),transparent_60%)]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-up">

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 border border-brand-gold/20
                          rounded-full px-4 py-1.5 text-brand-gold/80 text-xs font-medium
                          uppercase tracking-[0.2em] mb-10">
            <span className="w-1 h-1 bg-brand-gold rounded-full animate-pulse-slow" />
            Airport Rides in a Cybertruck
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
            Skip the rental counter.<br />
            <span className="text-brand-gold">Ride in a Cybertruck.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Premium airport pickup powered by Tesla Cybertruck.
            Transparent pricing. Booked in minutes.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { icon: IconLuggage, text: 'Covered luggage space' },
              { icon: IconSeat,    text: 'Seats up to 4' },
              { icon: IconScreen,   text: 'Rear-seat entertainment' },
            ].map((f) => (
              <span key={f.text}
                    className="inline-flex items-center gap-2 bg-brand-surface/60 border border-brand-border
                               rounded-full px-4 py-2 text-sm text-gray-400">
                <f.icon className="w-4 h-4 text-brand-gold/60" />
                {f.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 mb-16">
            <Link href="/book"
                  className="btn-primary text-lg py-5 px-10 flex items-center gap-3 group">
              Book Your Ride
              <IconArrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-brand-border/60 pt-10">
            {[
              { label: 'Starting At',  value: formatUSD(BASE_PRICE_CENTS) },
              { label: 'Per Mile',     value: `$${PER_MILE_CENTS / 100}` },
              { label: 'Service',      value: 'ATL Airport' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-semibold text-brand-gold font-display">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center justify-center gap-2 mt-10
                     text-gray-600 hover:text-gray-400 text-xs uppercase tracking-widest
                     transition-colors cursor-pointer animate-pulse-slow">
          <span>How it works</span>
          <IconChevronDown className="w-4 h-4" />
        </button>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-brand-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-gold/60 text-xs uppercase tracking-[0.25em] mb-3">The Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-medium mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg font-light">Booked in minutes. Picked up in style.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: IconLocation, step: '01', title: 'Set Pickup & Drop-off', desc: 'Choose airport (domestic or international terminal) or any address — going to or from ATL.' },
              { icon: IconClock,    step: '02', title: 'Pick Your Time', desc: 'Book in advance, or request a ride right now with about an hour wait.' },
              { icon: IconCard,      step: '03', title: 'Pay & Book', desc: 'Pay the full fare upfront via PayPal. No surprises, no hidden fees.' },
              { icon: IconCar,       step: '04', title: 'Ride in Style', desc: 'Your Cybertruck driver picks you up and texts you their live location.' },
            ].map((item) => (
              <div key={item.step} className="card hover:border-brand-gold/30 transition-all duration-300 group">
                <item.icon className="w-6 h-6 text-brand-gold/60 mb-5 group-hover:text-brand-gold transition-colors" />
                <p className="text-brand-gold/40 font-mono text-xs mb-2">{item.step}</p>
                <h3 className="text-base font-medium mb-2 text-white">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ride Features */}
      <section className="py-24 px-6 border-t border-brand-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-gold/60 text-xs uppercase tracking-[0.25em] mb-3">The Vehicle</p>
            <h2 className="font-display text-3xl md:text-4xl font-medium mb-3">Built for the Ride</h2>
            <p className="text-gray-500 text-lg font-light">Everything you need, nothing you don&#39;t.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: IconLuggage, title: 'Covered Luggage Space', desc: 'The Cybertruck\u2019s vault and frunk swallow suitcases, golf bags, and carry-ons — all fully covered and secure, rain or shine.' },
              { icon: IconSeat,    title: 'Room for 4 Riders', desc: 'Spacious seating comfortably fits up to 4 passengers with plenty of legroom for the whole group.' },
              { icon: IconScreen,   title: 'Rear-Seat Entertainment', desc: 'Screens and audio in the back keep everyone entertained on the way to or from the airport.' },
            ].map((f) => (
              <div key={f.title} className="card hover:border-brand-gold/30 transition-all duration-300 group text-center">
                <f.icon className="w-8 h-8 text-brand-gold/60 mb-5 mx-auto group-hover:text-brand-gold transition-colors" />
                <h3 className="text-base font-medium mb-2 text-white">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-brand-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand-gold/60 text-xs uppercase tracking-[0.25em] mb-3">The Fare</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium mb-3">Simple Pricing</h2>
          <p className="text-gray-500 mb-12 text-lg font-light">Flat base rate plus mileage. No surge pricing.</p>

          <div className="card max-w-md mx-auto text-left">
            <h3 className="font-medium text-base mb-5 text-brand-gold">Rate</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-gray-400">Base fare (minimum)</span>
                <span className="font-medium text-white">{formatUSD(BASE_PRICE_CENTS)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-400">Per mile from airport</span>
                <span className="font-medium text-white">${PER_MILE_CENTS / 100}/mi</span>
              </li>
              <li className="flex justify-between items-center pt-4 border-t border-brand-border text-gray-500 text-xs">
                <span>Example: 15-mile ride</span>
                <span>{formatUSD(BASE_PRICE_CENTS + 15 * PER_MILE_CENTS)}</span>
              </li>
              <li className="flex justify-between items-center text-gray-500 text-xs">
                <span>Example: 30-mile ride</span>
                <span>{formatUSD(BASE_PRICE_CENTS + 30 * PER_MILE_CENTS)}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-brand-border/40 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <IconCybertruck className="w-5 h-4 text-brand-gold" />
          <span className="brand-wordmark text-sm text-white">CYBER RIDE</span>
        </div>
        <p className="text-gray-600">Airport Rides · Atlanta Metro Area</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <a href="tel:7069402887" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors">
            <IconPhone className="w-4 h-4" /> (706) 940-2887
          </a>
          <a href="mailto:info@nativelab.co" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors">
            <IconMail className="w-4 h-4" /> info@nativelab.co
          </a>
        </div>
        <p className="mt-4 text-gray-700 text-xs">© {new Date().getFullYear()} Cyber Ride. All rights reserved.</p>
      </footer>
    </div>
  );
}
