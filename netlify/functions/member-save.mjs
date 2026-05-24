import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const tier = String(body.tier || '').trim();
  const adminKey = String(body.adminKey || '');
  const expected = Netlify.env.get('ADMIN_UNLOCK_PASSWORD');

  if (!expected || adminKey !== expected || !email || !tier) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const store = getStore('ai-opportunities-members');

  await store.set(email, JSON.stringify({
    email,
    tier,
    active: true,
    updatedAt: new Date().toISOString()
  }));

  return new Response(JSON.stringify({
    ok: true,
    email,
    tier,
    active: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/member-save' };
