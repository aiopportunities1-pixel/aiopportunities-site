export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  const body = await req.json().catch(() => ({}));
  const message = String(body?.message || '').slice(0, 1200);
  const orderContext = body?.orderContext || {};

  if (!message.trim()) {
    return new Response(JSON.stringify({ reply: 'Tell me what you need and I can help you scope it.' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const fallback = () => {
    const lower = message.toLowerCase();
    if (lower.includes('grad') || lower.includes('card') || lower.includes('flyer') || lower.includes('poster')) {
      return 'For basic cards or simple graphics, I’d keep it affordable: 10 basic cards around $10-$20, 10 simple custom cards around $20-$35, and premium/heavy edits around $40-$60. The $5 deposit only starts review.';
    }
    if (lower.includes('website')) return 'For websites, a starter one-page site starts around $100-$175. A business site is usually $150-$275, and chatbot/payment/custom order features make it a bigger bundle.';
    if (lower.includes('video')) return 'AI-video-only starts around $5 each. If you need editing, scripts, marketing, or rush delivery, that can raise the quote.';
    if (lower.includes('automation')) return 'Automation depends on the setup. A simple starter automation can be $70-$125, while custom multi-step automation is usually $175-$300.';
    return 'I can help scope AI videos, websites, automations, graphics, editing, memberships, and custom orders. Tell me what you need, how many, and how fast you need it.';
  };

  if (!apiKey) {
    return new Response(JSON.stringify({ reply: fallback() }), { headers: { 'Content-Type': 'application/json' } });
  }

  const system = `You are the AI Opportunities website chatbot. You are helpful, smart, direct, and sales-focused, but you must protect the business from bad pricing.

Brand context:
- AI Opportunities can do anything digitally: websites, AI videos, graphics, editing, automation, chatbots, memberships, custom order systems, social media help, and digital consulting.
- The style is confident, friendly, modern, and easy to understand.
- The $5 deposit starts review only. It is NOT full payment.
- Final quote can change after manual review.

Pricing brain:
- Always classify the request before pricing.
- Do not compare unrelated categories.
- Graphic design is NOT website pricing.
- Basic card = template/name/photo swap: $1-$2 each.
- Custom simple card = personalized design: $2-$4 each.
- Premium/heavy card = advanced edits/effects: $5-$10 each.
- 10 basic cards: $10-$20.
- 10 custom simple cards: $20-$35.
- 10 premium/heavy cards: $40-$60.
- Flyers/posters/thumbnails/banners/simple graphics: $10-$25 for one, $25-$50 for small packs.
- AI video only: $5 each.
- Basic one-page website: $100-$175.
- Business website: $150-$275.
- Website plus chatbot/payment/custom order panel: $300-$600 depending on scope.
- Simple automation: $70-$125.
- Custom multi-step automation: $175-$300.

Rules:
- If user asks a normal question, answer it intelligently.
- If user asks for a quote, give a fair range and ask 1 useful follow-up only if needed.
- Never say random inflated prices for small graphic orders.
- Never say undefined.
- Do not promise the owner will do unlimited work for tiny prices.
- Keep replies short: 2-5 sentences max.
- If a user asks for something outside pricing, answer like a real assistant, not a script.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.25,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: `Current order form context: ${JSON.stringify(orderContext)}\n\nCustomer message: ${message}` }
        ]
      })
    });

    if (!response.ok) throw new Error('OpenAI response failed');
    const data = await response.json();
    let reply = data.output_text || '';
    if (!reply && Array.isArray(data.output)) {
      reply = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    }
    reply = reply.trim() || fallback();

    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ reply: fallback() }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { path: '/chat-ai' };
