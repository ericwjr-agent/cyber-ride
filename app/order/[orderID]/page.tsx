import Link from 'next/link';
import { IconCybertruck, IconCheck } from '@/components/icons';
import { formatUSD } from '@/lib/pricing';

const PAYPAL_API = process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

async function getPayPalOrder(orderID: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    return await res.json();
  } catch {
    return null;
  }
}

export default async function OrderPage({ params }: { params: { orderID: string } }) {
  const order = await getPayPalOrder(params.orderID);

  const isCompleted = order?.status === 'COMPLETED';
  const amount = order?.purchase_units?.[0]?.amount?.value;
  const description = order?.purchase_units?.[0]?.description;

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
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

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          {/* Status hero */}
          <div className="text-center mb-10">
            {isCompleted ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                                bg-brand-gold/10 border border-brand-gold/20 mb-6">
                  <IconCheck className="w-8 h-8 text-brand-gold" />
                </div>
                <h1 className="font-display text-3xl font-medium text-brand-gold mb-3">Booking Confirmed</h1>
                <p className="text-gray-500 text-lg font-light">
                  Your Cybertruck ride is booked and paid for.
                </p>
              </>
            ) : order ? (
              <>
                <h1 className="font-display text-3xl font-medium text-white mb-3">Order {order.status}</h1>
                <p className="text-gray-500 text-lg font-light">
                  Something looks off with this order. Contact us if you have questions.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl font-medium text-white mb-3">Order Not Found</h1>
                <p className="text-gray-500 text-lg font-light">
                  We could not find this booking. Check your confirmation email for the correct link.
                </p>
              </>
            )}
          </div>

          {/* Order details */}
          {order && (
            <div className="card mb-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-gray-300 text-xs">{params.orderID}</span>
                </div>
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="text-brand-gold font-semibold">{formatUSD(Math.round(parseFloat(amount) * 100))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={isCompleted ? 'text-green-400' : 'text-yellow-400'}>
                    {order.status}
                  </span>
                </div>
                {description && (
                  <div className="flex justify-between pt-3 border-t border-brand-border">
                    <span className="text-gray-500">Description</span>
                    <span className="text-gray-300 text-right text-xs max-w-[200px]">{description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What happens next */}
          {isCompleted && (
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 text-sm text-left mb-6">
              <p className="font-medium mb-1 text-gray-300">What happens next</p>
              <p className="text-gray-500 leading-relaxed">
                Your driver will text you with their real-time location before pickup.
                For questions, reply to your confirmation email.
              </p>
            </div>
          )}

          <Link href="/" className="btn-primary block text-center text-sm py-3 px-6 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
