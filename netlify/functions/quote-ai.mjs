export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$75+',
      reason: 'OPENAI_API_KEY missing in Netlify environment variables.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const order = await req.json();

  const prompt = `You are pricing digital services for AI Opportunities. Return ONLY valid JSON with keys: price, reason, recommendedPackage. Consider services, quantity, frequency, details, timeline, and budget. Create realistic easy-yes pricing. Order: ${JSON.stringify(order)}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt
    })
  });

  const data = await response.json();
  const text = data.output_text || '{}';

  try {
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({
      price: '$100+',
      reason: 'AI generated a custom estimate.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/quote-ai'
};
