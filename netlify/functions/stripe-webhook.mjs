import { getStore } from '@netlify/blobs';

function tierFromPrice(priceId) {
  if (priceId === Netlify.env.get('STRIPE_SUPPORTER_PRICE_ID')) return 'Supporter Member';
  if (priceId === Netlify.env.get('STRIPE_SUPPORTER_PLUS_PRICE_ID')) return 'Supporter+ Member';
  if (priceId === Netlify.env.get('PRICE_MASTER')) return 'Master Member';
  return 'Guest / Not verified';
}

async function getCustomerEmail(customerId, stripeKey) {
  if (!customerId || !stripeKey) return '';
  const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` }
  });
  const data = await res.json().catch(() => ({}));
  return String(data.email || '').trim().toLowerCase();
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  const event = await req.json().catch(() => null);

  if (!event || !event.type || !event.data?.object) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const store = getStore('ai-opportunities-members');
  const object = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const email = String(object.customer_details?.email || object.customer_email || '').trim().toLowerCase();
    const tier = tierFromPrice(object.metadata?.price_id || object.metadata?.price || '');

    if (email && tier !== 'Guest / Not verified') {
      await store.set(email, JSON.stringify({ email, tier, active: true, source: 'stripe', updatedAt: new Date().toISOString() }));
    }
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const priceId = object.items?.data?.[0]?.price?.id || '';
    const tier = tierFromPrice(priceId);
    const email = await getCustomerEmail(object.customer, stripeKey);

    if (email && tier !== 'Guest / Not verified') {
      const active = ['active', 'trialing'].includes(object.status);
      await store.set(email, JSON.stringify({ email, tier, active, source: 'stripe', subscriptionId: object.id, updatedAt: new Date().toISOString() }));
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const email = await getCustomerEmail(object.customer, stripeKey);
    if (email) {
      await store.set(email, JSON.stringify({ email, tier: 'Guest / Not verified', active: false, source: 'stripe', subscriptionId: object.id, updatedAt: new Date().toISOString() }));
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/stripe-webhook' };
