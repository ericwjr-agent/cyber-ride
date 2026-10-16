import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import VisitorTracker from '@/components/VisitorTracker';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Ride — Airport Rides in a Cybertruck',
  description:
    'Premium airport pickup powered by Tesla Cybertruck. Transparent pricing, booked in minutes.',
  keywords: ['airport ride', 'Cybertruck', 'airport transfer', 'Atlanta airport', 'ride booking'],
  openGraph: {
    title: 'Cyber Ride — Airport Rides in a Cybertruck',
    description: 'Book your Cybertruck airport ride. Transparent pricing, premium experience.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#0a0a0c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <VisitorTracker />
      </body>
    </html>
  );
}
