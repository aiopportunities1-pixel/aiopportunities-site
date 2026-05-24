export default async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  const body = await req.json().catch(() => ({}));
  const expected = Netlify.env.get('ADMIN_UNLOCK_PASSWORD');
  const ok = Boolean(expected && body.adminKey === expected);
  return new Response(JSON.stringify({ ok }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/member-admin' };
