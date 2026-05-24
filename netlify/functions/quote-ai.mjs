export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$25+',
      reason: 'OPENAI_API_KEY missing in Netlify environment variables.'
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const order = await req.json();

  const prompt = `You are pricing custom digital services for AI Opportunities. Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

The client request is:
${JSON.stringify(order)}

Pricing rules:
- AI Video starts at $5 per video.
- Editing starts at $5 per quick edit.
- If quantity is 2 AI videos and frequency is weekly, do NOT quote $300/mo. Use around $10/week to $25/week depending on edits.
- If frequency is weekly, return a WEEKLY price like "$10/week", not monthly.
- If frequency is twice-weekly, return a weekly price for that weekly amount.
- If frequency is daily, return a weekly estimate unless the user clearly asks monthly.
- If frequency is monthly, return monthly.
- If one-time, return one-time.
- Keep prices easy yes and affordable.
- Never return undefined.
- Keep reason short and clear.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        price: '$10/week',
        reason: 'Starter estimate based on low-cost AI video pricing.',
        recommendedPackage: 'Weekly AI Video Starter'
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    let text = data.output_text || '';

    if (!text && Array.isArray(data.output)) {
      text = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({
      price: parsed.price || '$10/week',
      reason: parsed.reason || 'AI reviewed the weekly order using affordable starter pricing.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$10/week',
      reason: 'Backup quote based on 2 AI videos weekly at $5 each.',
      recommendedPackage: 'Weekly AI Video Starter'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = {
  path: '/quote-ai'
};
