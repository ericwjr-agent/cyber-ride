import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Ride — Airport Rides in a Cybertruck',
  description:
    'Premium airport rides powered by Cybertruck. Book your ride from the airport with transparent pricing.',
  keywords: ['airport ride', 'Cybertruck', 'airport transfer', 'Atlanta airport', 'ride booking'],
  openGraph: {
    title: 'Cyber Ride — Airport Rides in a Cybertruck',
    description: 'Book your Cybertruck airport ride. Transparent pricing, premium experience.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
  themeColor: '#00d4ff',
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
      </body>
    </html>
  );
}
