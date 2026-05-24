import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const email = String(url.searchParams.get('email') || '').trim().toLowerCase();

  if (!email) {
    return new Response(JSON.stringify({ ok: false, tier: 'Guest / Not verified' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const store = getStore('ai-opportunities-members');
  const record = await store.get(email, { type: 'json' });

  return new Response(JSON.stringify({
    ok: true,
    tier: record?.tier || 'Guest / Not verified',
    active: record?.active || false,
    email
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/member-lookup' };
