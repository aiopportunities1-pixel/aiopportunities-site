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
  const discordUserId = String(body.discordUserId || '').replace(/\D/g, '');

  if (!email || !discordUserId) {
    return new Response(JSON.stringify({ ok: false, error: 'Email and Discord user ID are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const links = getStore('ai-opportunities-discord-links');
  await links.set(email, JSON.stringify({
    email,
    discordUserId,
    updatedAt: new Date().toISOString()
  }));

  return new Response(JSON.stringify({ ok: true, email, discordUserId }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/discord-save' };
