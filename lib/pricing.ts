// Pricing logic for Cyber Ride airport rides

export const BASE_PRICE_CENTS = 10000;  // $100 minimum
export const PER_MILE_CENTS   = 400;    // $4.00 per mile from airport
export const BUFFER_MINUTES   = 20;

/** Calculate ride price: $100 + $4/mile from airport to destination */
export function ridePrice(distanceMiles: number): number {
  return BASE_PRICE_CENTS + Math.round(distanceMiles * PER_MILE_CENTS);
}

/** Format cents as USD string e.g. "$150.00" */
export function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/** Build a human-readable price breakdown */
export function priceBreakdown(distanceMiles: number) {
  const base = BASE_PRICE_CENTS;
  const mileageFee = Math.round(distanceMiles * PER_MILE_CENTS);
  const total = base + mileageFee;

  return {
    base,
    mileageFee,
    total,
  };
}
