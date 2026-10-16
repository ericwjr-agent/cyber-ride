import { NextResponse }  from 'next/server';
import { sendBookingEmails } from '@/lib/email';
import type { BookingEmailData } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName, customerEmail, customerPhone,
      flightNumber,
      pickupAddress, destinationAddress, scheduleLabel,
      etaMinutes, distanceMiles,
      totalCents,
    } = body;

    const bookingTime = new Date().toLocaleString('en-US', {
      timeZone:  'America/New_York',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const emailData: BookingEmailData = {
      customerName,
      customerEmail,
      customerPhone,
      flightNumber,
      pickupAddress,
      destinationAddress,
      scheduleLabel,
      etaMinutes,
      distanceMiles,
      totalCents,
      bookingTime,
    };

    await sendBookingEmails(emailData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('notify error:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
