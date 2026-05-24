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
- Always respect the selected budget vibe first.
- starter budget means roughly $5-$100.
- serious budget means roughly $100-$300.
- premium budget means $300+.
- You can go above the selected budget only when the request clearly needs more work. If you go above budget, explain why in one short note.
- AI Video starts at $5 per video.
- Editing starts at $5 per quick edit.
- A simple one-page website starts around $50-$100.
- A one-page website with a custom order form, Stripe deposit button, and a basic chatbot should usually be $100-$150 one-time, not $300.
- Only quote $300+ for bigger builds like multiple pages, memberships, advanced chatbot, automations, or a full custom platform.
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
        temperature: 0.15
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        price: '$75 one-time',
        reason: 'Starter estimate based on the selected budget and request details.',
        recommendedPackage: 'Starter Custom Order'
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
      price: parsed.price || '$75 one-time',
      reason: parsed.reason || 'AI reviewed the order using the selected budget and request details.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$75 one-time',
      reason: 'Backup quote based on the selected budget and request details.',
      recommendedPackage: 'Starter Custom Order'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = {
  path: '/quote-ai'
};
