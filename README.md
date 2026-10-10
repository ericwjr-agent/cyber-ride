# ⚡ Cyber Ride — Airport Rides in a Cybertruck

Premium airport pickup powered by Tesla Cybertruck. Book online, pay upfront.

## Pricing

- **Base fare:** $100 (minimum)
- **Per mile:** $4.00 from airport to destination
- **Payment:** Full amount charged at booking via PayPal

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- PayPal (capture flow — full payment at booking)
- Resend (booking confirmation emails)
- Google Maps API (distance calculation + autocomplete)

## Environment Variables

```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_HOST_EMAIL=
NEXT_PUBLIC_APP_URL=
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
