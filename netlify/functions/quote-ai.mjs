export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$75+',
      reason: 'OPENAI_API_KEY missing in Netlify environment variables.'
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const order = await req.json();

  const prompt = `You are pricing custom digital services for AI Opportunities. Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

The client request is:
${JSON.stringify(order)}

Rules:
- Never return undefined.
- Never price everything at $50.
- Make the price realistic and easy-yes.
- If the user typed their service request in details, use that as the main source of truth.
- If selected services exist, use them too.
- If frequency is weekly, twice-weekly, monthly, or daily, price it as a recurring monthly service.
- Use friendly ranges like "$150/mo", "$250/mo", "$300+", "$75 one-time".
- Keep the reason short and clear.`;

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
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        price: '$100+',
        reason: 'AI pricing had a temporary issue. Use this as a starter quote and review manually.',
        recommendedPackage: 'Starter Custom Order'
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    let text = data.output_text || '';

    if (!text && Array.isArray(data.output)) {
      text = data.output
        .flatMap(item => item.content || [])
        .map(part => part.text || '')
        .join('');
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({
      price: parsed.price || '$100+',
      reason: parsed.reason || 'AI reviewed the order and created a starter quote.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$100+',
      reason: 'AI quote failed for a moment. Use this as a starter estimate and review manually.',
      recommendedPackage: 'Starter Custom Order'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = {
  path: '/quote-ai'
};
