export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const tier = String(body.tier || '').trim();
  const adminKey = String(body.adminKey || '');
  const expected = Netlify.env.get('ADMIN_UNLOCK_PASSWORD');

  if (!expected || adminKey !== expected || !email || !tier) {
    return new Response(JSON.stringify({ ok: false }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true, email, tier }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/member-save' };
