import { NextResponse }  from 'next/server';
import { sendBookingEmails } from '@/lib/email';
import type { BookingEmailData } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName, customerEmail, customerPhone,
      flightNumber, pickupTime,
      address, etaMinutes, distanceMiles,
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
      pickupTime,
      address,
      etaMinutes,
      distanceMiles,
      totalCents,
      bookingTime,
    };

    await sendBookingEmails(emailData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('notify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
