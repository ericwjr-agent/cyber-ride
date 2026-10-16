import BookingFlow from '@/components/BookingFlow';
import Link from 'next/link';
import { IconCybertruck } from '@/components/icons';

export const metadata = {
  title: 'Book Your Ride — Cyber Ride',
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-brand-border/60">
        <Link href="/" className="flex items-center gap-3">
          <IconCybertruck className="w-6 h-5 text-brand-gold" />
          <span className="brand-wordmark text-sm">
            <span className="text-white">CYBER </span>
            <span className="text-brand-gold">RIDE</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← Back
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-medium mb-2">Book Your Airport Ride</h1>
        <p className="text-gray-500 mb-8 font-light">Premium pickup in a Cybertruck. Pay upfront — no surprises.</p>
        <BookingFlow />
      </div>
    </div>
  );
}
