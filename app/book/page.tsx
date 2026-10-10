import BookingFlow from '@/components/BookingFlow';
import Link from 'next/link';

export const metadata = {
  title: 'Book Your Ride — Cyber Ride',
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="brand-wordmark text-lg">
            CYBER <span className="text-brand-cyan">RIDE</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Book Your Airport Ride</h1>
        <p className="text-gray-400 mb-8">Premium pickup in a Cybertruck. Pay upfront — no surprises.</p>
        <BookingFlow />
      </div>
    </div>
  );
}
