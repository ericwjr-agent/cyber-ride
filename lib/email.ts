import { Resend } from 'resend';
import { formatUSD } from './pricing';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom()      { return process.env.RESEND_FROM_EMAIL  ?? 'Cyber Ride <onboarding@resend.dev>'; }
function getHostEmail() { return process.env.RESEND_HOST_EMAIL  ?? ''; }

export interface BookingEmailData {
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string;
  flightNumber:   string;
  pickupAddress:  string;
  destinationAddress: string;
  scheduleLabel:  string;
  etaMinutes:     number;
  distanceMiles:  number;
  totalCents:     number;
  bookingTime:    string;
}

/* ── Send both emails in parallel ─────────────────────────────── */
export async function sendBookingEmails(data: BookingEmailData) {
  const sends = [sendCustomerConfirmation(data)];
  if (getHostEmail()) sends.push(sendHostAlert(data));
  const results = await Promise.allSettled(sends);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Email send ${i} failed:`, r.reason);
    }
  });
}

/* ── Host alert ────────────────────────────────────────────────── */
async function sendHostAlert(data: BookingEmailData) {
  return getResend().emails.send({
    from:     getFrom(),
    to:       getHostEmail(),
    replyTo:  'Eric@nativelab.co',
    subject:  `🚨 New Ride Booking — ${data.customerName} · Flight ${data.flightNumber}`,
    html:     hostAlertHtml(data),
  });
}

/* ── Customer confirmation ─────────────────────────────────────── */
async function sendCustomerConfirmation(data: BookingEmailData) {
  return getResend().emails.send({
    from:     getFrom(),
    to:       data.customerEmail,
    replyTo:  'Eric@nativelab.co',
    subject:  `⚡ Your Cyber Ride is booked, ${data.customerName}!`,
    html:     customerConfirmationHtml(data),
  });
}

/* ════════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
   ════════════════════════════════════════════════════════════════ */

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,-apple-system,sans-serif;color:#ffffff;">
  <div style="max-width:540px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:36px;">
      <span style="font-size:26px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">
        CYBER&nbsp;<span style="color:#00d4ff;">RIDE</span>
      </span>
    </div>

    ${content}

    <!-- Footer -->
    <div style="text-align:center;color:#4b5563;font-size:12px;border-top:1px solid #1f2937;padding-top:24px;margin-top:40px;">
      <p style="margin:0 0 4px;">Cyber Ride · Airport Rides in a Cybertruck · Atlanta</p>
    </div>
  </div>
</body>
</html>`;
}

/* ── Customer confirmation template ────────────────────────────── */
function customerConfirmationHtml(d: BookingEmailData): string {
  return base(`
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:60px;margin-bottom:12px;">⚡</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
        You're booked, ${d.customerName}!
      </h1>
      <p style="margin:0;color:#9ca3af;font-size:15px;">
        Your Cybertruck ride from the airport is confirmed.
      </p>
    </div>

    <!-- Booking summary -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
        Booking Summary
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Pickup</td>
          <td style="text-align:right;color:#fff;">${d.pickupAddress}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Destination</td>
          <td style="text-align:right;color:#fff;">${d.destinationAddress}</td>
        </tr>
        ${d.flightNumber ? `<tr>
          <td style="padding:6px 0;color:#9ca3af;">Flight Number</td>
          <td style="text-align:right;color:#fff;">${d.flightNumber}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Pickup Time</td>
          <td style="text-align:right;color:#fff;">${d.scheduleLabel}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Distance</td>
          <td style="text-align:right;color:#fff;">${d.distanceMiles} mi · ETA ~${d.etaMinutes} min</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Total Paid</td>
          <td style="text-align:right;color:#00d4ff;font-weight:600;">${formatUSD(d.totalCents)}</td>
        </tr>
      </table>
    </div>

    <!-- What's next -->
    <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:32px;">
      <p style="margin:0 0 6px;font-weight:600;font-size:14px;">📱 What happens next</p>
      <p style="margin:0;color:#93c5fd;font-size:13px;">
        Your driver will text <strong>${d.customerPhone}</strong> with their live location before pickup.
      </p>
    </div>
  `);
}

/* ── Host alert template ───────────────────────────────────────── */
function hostAlertHtml(d: BookingEmailData): string {
  return base(`
    <!-- Alert header -->
    <div style="background:#111827;border:1px solid #374151;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
        New Booking
      </p>
      <h2 style="margin:8px 0 0;font-size:20px;font-weight:800;">${d.customerName}</h2>
      <p style="margin:4px 0 0;color:#9ca3af;font-size:14px;">${d.bookingTime}</p>
    </div>

    <!-- Customer details -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
        Customer
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:5px 0;color:#9ca3af;width:120px;">Phone</td><td style="color:#fff;">${d.customerPhone}</td></tr>
        <tr><td style="padding:5px 0;color:#9ca3af;">Email</td><td style="color:#fff;">${d.customerEmail}</td></tr>
        ${d.flightNumber ? `<tr><td style="padding:5px 0;color:#9ca3af;">Flight</td><td style="color:#fff;">${d.flightNumber}</td></tr>` : ''}
        <tr><td style="padding:5px 0;color:#9ca3af;">Pickup Time</td><td style="color:#fff;">${d.scheduleLabel}</td></tr>
        <tr><td style="padding:5px 0;color:#9ca3af;">Pickup</td><td style="color:#fff;">${d.pickupAddress}</td></tr>
        <tr><td style="padding:5px 0;color:#9ca3af;">Destination</td><td style="color:#fff;">${d.destinationAddress}</td></tr>
        <tr><td style="padding:5px 0;color:#9ca3af;">Distance</td><td style="color:#fff;">${d.distanceMiles} mi · ETA ~${d.etaMinutes} min</td></tr>
      </table>
    </div>

    <!-- Financials -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
        Financials
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#9ca3af;">Total Paid</td>
          <td style="text-align:right;color:#00d4ff;font-weight:700;">${formatUSD(d.totalCents)}</td>
        </tr>
      </table>
    </div>
  `);
}
