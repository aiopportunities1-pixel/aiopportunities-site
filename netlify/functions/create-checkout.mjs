export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY in Netlify environment variables.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];

  const safeItems = items
    .map((item) => ({
      service: String(item.service || 'Prebuilt Service').slice(0, 80),
      amount: Math.max(1, Math.min(500, Number(item.amount) || 0))
    }))
    .filter((item) => item.amount > 0);

  if (!safeItems.length) {
    return new Response(JSON.stringify({ error: 'No services selected.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const total = safeItems.reduce((sum, item) => sum + item.amount, 0);
  const siteUrl = req.headers.get('origin') || 'https://aiopportunities.netlify.app';

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${siteUrl}/?checkout=success`);
  params.append('cancel_url', `${siteUrl}/?checkout=cancelled`);
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', String(total * 100));
  params.append('line_items[0][price_data][product_data][name]', `AI Opportunities Prebuilt Services - $${total}`);
  params.append('line_items[0][price_data][product_data][description]', safeItems.map((item) => `${item.service} ($${item.amount})`).join(', '));
  params.append('metadata[services]', safeItems.map((item) => `${item.service}: $${item.amount}`).join(' | '));

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'Stripe checkout failed.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ url: data.url, total }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = {
  path: '/create-checkout'
};
