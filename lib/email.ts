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
  orderId:        string;
}

/* ── Send both emails in parallel ─────────────────────────────── */
export async function sendBookingEmails(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set — cannot send booking emails');
  }

  const sends = [sendCustomerConfirmation(data)];
  if (getHostEmail()) sends.push(sendHostAlert(data));

  const results = await Promise.allSettled(sends);
  const failures = results.filter((r) => r.status === 'rejected');

  if (failures.length > 0) {
    failures.forEach((r, i) => {
      const rejected = r as PromiseRejectedResult;
      console.error(`Email send ${i} failed:`, rejected.reason);
    });
    throw new Error(`${failures.length} of ${results.length} email(s) failed to send`);
  }
}

/* ── Host alert ────────────────────────────────────────────────── */
async function sendHostAlert(data: BookingEmailData) {
  return getResend().emails.send({
    from:     getFrom(),
    to:       getHostEmail(),
    replyTo:  'Eric@nativelab.co',
    subject:  `New Ride Booking — ${data.customerName}${data.flightNumber ? ` · Flight ${data.flightNumber}` : ''}`,
    html:     hostAlertHtml(data),
  });
}

/* ── Customer confirmation ─────────────────────────────────────── */
async function sendCustomerConfirmation(data: BookingEmailData) {
  return getResend().emails.send({
    from:     getFrom(),
    to:       data.customerEmail,
    replyTo:  'Eric@nativelab.co',
    subject:  `Your Cyber Ride is booked, ${data.customerName}`,
    html:     customerConfirmationHtml(data),
  });
}

/* ════════════════════════════════════════════════════════════════
   DESIGN SYSTEM (mirrors website)
   ── Gold:      #c5a572
   ── Dark:      #0a0a0c
   ── Surface:   #141416
   ── Border:    #232328
   ── Muted:     #1a1a1d
   ── Display:   Space Grotesk
   ── Body:      Inter
   ════════════════════════════════════════════════════════════════ */

const FONT_STACK_DISPLAY = "'Space Grotesk', 'Inter', -apple-system, sans-serif";
const FONT_STACK_BODY    = "'Inter', -apple-system, sans-serif";

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:${FONT_STACK_BODY};color:#e5e5e7;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Wordmark -->
    <div style="text-align:center;margin-bottom:40px;">
      <span style="font-family:${FONT_STACK_DISPLAY};font-size:24px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;">
        CYBER&nbsp;<span style="color:#c5a572;">RIDE</span>
      </span>
    </div>

    ${content}

    <!-- Footer -->
    <div style="text-align:center;color:#555;font-size:12px;border-top:1px solid #232328;padding-top:28px;margin-top:44px;">
      <p style="margin:0 0 6px;font-family:${FONT_STACK_DISPLAY};font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#666;">Cyber Ride</p>
      <p style="margin:0;color:#444;">Airport Rides in a Cybertruck · Atlanta</p>
    </div>
  </div>
</body>
</html>`;
}

/* ── Shared card style ─────────────────────────────────────────── */
const CARD = "background:#141416;border:1px solid #232328;border-radius:16px;padding:28px;margin-bottom:20px;";
const LABEL = "font-family:${FONT_STACK_DISPLAY};font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#666;margin:0 0 18px;";
const ROW_LABEL = "padding:7px 0;color:#888;font-size:14px;";
const ROW_VALUE = "text-align:right;color:#e5e5e7;font-size:14px;font-weight:500;";

/* ── Customer confirmation template ────────────────────────────── */
function customerConfirmationHtml(d: BookingEmailData): string {
  return base(`
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="margin-bottom:16px;line-height:1;">
        <svg width="56" height="34" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;">
          <path d="M2 26 L5 21 L24 21 L45 6 L51 6 L64 12 L66 21 L97 24 L98 34 L92 37 L88 37 L49 44 L26 37 L5 37 L2 37 Z" stroke="#c5a572" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M24 21 L45 6 L51 6 L64 12 L66 21" stroke="#c5a572" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="17" cy="44" r="8" fill="#c5a572"/>
          <circle cx="81" cy="44" r="8" fill="#c5a572"/>
        </svg>
      </div>
      <h1 style="font-family:${FONT_STACK_DISPLAY};margin:0 0 10px;font-size:28px;font-weight:500;color:#ffffff;letter-spacing:-0.02em;">
        You're booked, ${d.customerName}
      </h1>
      <p style="margin:0;color:#888;font-size:15px;font-weight:300;">
        Your Cybertruck ride from the airport is confirmed.
      </p>
    </div>

    <!-- Booking summary -->
    <div style="${CARD}">
      <p style="${LABEL}">Booking Summary</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="${ROW_LABEL}">Pickup</td>
          <td style="${ROW_VALUE}">${d.pickupAddress}</td>
        </tr>
        <tr>
          <td style="${ROW_LABEL}">Destination</td>
          <td style="${ROW_VALUE}">${d.destinationAddress}</td>
        </tr>
        ${d.flightNumber ? `<tr>
          <td style="${ROW_LABEL}">Flight</td>
          <td style="${ROW_VALUE}">${d.flightNumber}</td>
        </tr>` : ''}
        <tr>
          <td style="${ROW_LABEL}">Pickup Time</td>
          <td style="${ROW_VALUE}">${d.scheduleLabel}</td>
        </tr>
        <tr>
          <td style="${ROW_LABEL}">Distance</td>
          <td style="${ROW_VALUE}">${d.distanceMiles} mi · ETA ~${d.etaMinutes} min</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;border-top:1px solid #232328;color:#888;font-size:14px;">Total Paid</td>
          <td style="text-align:right;padding:12px 0 0;border-top:1px solid #232328;color:#c5a572;font-size:18px;font-weight:600;font-family:${FONT_STACK_DISPLAY};">${formatUSD(d.totalCents)}</td>
        </tr>
      </table>
    </div>

    <!-- What's next -->
    <div style="background:#1a1a1d;border:1px solid #232328;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-family:${FONT_STACK_DISPLAY};font-weight:500;font-size:13px;color:#c5a572;text-transform:uppercase;letter-spacing:0.15em;">What happens next</p>
      <p style="margin:0;color:#999;font-size:14px;line-height:1.6;font-weight:300;">
        Your driver will text <strong style="color:#e5e5e7;font-weight:600;">${d.customerPhone}</strong> with their live location before pickup.
      </p>
    </div>

    <!-- View booking link -->
    <a href="https://cyberpicksupatl.com/order/${d.orderId}"
       style="display:block;text-align:center;background:#c5a572;color:#0a0a0c;font-family:${FONT_STACK_DISPLAY};font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;padding:16px 24px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
      View Your Booking
    </a>
  `);
}

/* ── Host alert template ───────────────────────────────────────── */
function hostAlertHtml(d: BookingEmailData): string {
  return base(`
    <!-- Alert header -->
    <div style="${CARD}">
      <p style="font-family:${FONT_STACK_DISPLAY};margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#c5a572;">New Booking</p>
      <h2 style="font-family:${FONT_STACK_DISPLAY};margin:10px 0 4px;font-size:22px;font-weight:500;color:#ffffff;letter-spacing:-0.01em;">${d.customerName}</h2>
      <p style="margin:0;color:#666;font-size:13px;">${d.bookingTime}</p>
    </div>

    <!-- Customer details -->
    <div style="${CARD}">
      <p style="${LABEL}">Customer</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="${ROW_LABEL}width:120px;">Phone</td><td style="${ROW_VALUE}">${d.customerPhone}</td></tr>
        <tr><td style="${ROW_LABEL}">Email</td><td style="${ROW_VALUE}">${d.customerEmail}</td></tr>
        ${d.flightNumber ? `<tr><td style="${ROW_LABEL}">Flight</td><td style="${ROW_VALUE}">${d.flightNumber}</td></tr>` : ''}
        <tr><td style="${ROW_LABEL}">Pickup Time</td><td style="${ROW_VALUE}">${d.scheduleLabel}</td></tr>
        <tr><td style="${ROW_LABEL}">Pickup</td><td style="${ROW_VALUE}">${d.pickupAddress}</td></tr>
        <tr><td style="${ROW_LABEL}">Destination</td><td style="${ROW_VALUE}">${d.destinationAddress}</td></tr>
        <tr><td style="${ROW_LABEL}">Distance</td><td style="${ROW_VALUE}">${d.distanceMiles} mi · ETA ~${d.etaMinutes} min</td></tr>
      </table>
    </div>

    <!-- Financials -->
    <div style="${CARD}">
      <p style="${LABEL}">Financials</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#888;font-size:14px;">Total Paid</td>
          <td style="text-align:right;color:#c5a572;font-size:20px;font-weight:600;font-family:${FONT_STACK_DISPLAY};">${formatUSD(d.totalCents)}</td>
        </tr>
      </table>
    </div>
  `);
}
