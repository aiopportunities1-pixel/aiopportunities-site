export default async (req) => {
  const url = new URL(req.url);
  const email = String(url.searchParams.get('email') || '').toLowerCase();
  if (!email) {
    return new Response(JSON.stringify({ ok: false, tier: 'Guest / Not verified' }), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true, tier: 'Guest / Not verified' }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/member-lookup' };
