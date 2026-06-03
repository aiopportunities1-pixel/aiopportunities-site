export default async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });

  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  const body = await req.json().catch(() => ({}));
  const message = String(body?.message || '').slice(0, 1400);
  const orderContext = body?.orderContext || {};
  const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];

  if (!message.trim()) {
    return new Response(JSON.stringify({ reply: 'Tell me what you want built and I’ll help you choose the best AI Opportunities service.' }), { headers: { 'Content-Type': 'application/json' } });
  }

  const fallback = () => {
    const lower = message.toLowerCase();
    if (lower.includes('discord') || lower.includes('community')) return 'The Discord is where AI Opportunities can give members resources, updates, money-method meetings, templates, and support. If you want help growing a community, I’d pair Discord with content and a clear membership offer.';
    if (lower.includes('membership')) return 'Memberships are best for people who want ongoing AI resources, meetings, discounts, templates, and priority help. Start with Supporter if you want access, Supporter+ for more resources, and Master for more direct strategy help.';
    if (lower.includes('website')) return 'For websites, I’d start with a clean one-page business site around $75-$175+. Add chatbot, payments, custom orders, or automation if you want it to feel more advanced.';
    if (lower.includes('video') || lower.includes('content')) return 'For content, start with short AI videos, hooks, captions, and a posting plan. AI videos can start around $5 each, but strategy/editing/rush delivery can raise the price.';
    if (lower.includes('automation')) return 'For automation, start with the task you repeat most: leads, follow-ups, forms, reminders, content planning, or order details. Simple setups can be $70-$125; custom multi-step systems can be $175-$300+.';
    if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) return 'I can help price it, but I need the service type, deadline, quantity, and budget vibe. The $5 deposit starts review only and is not full payment.';
    return 'I can help with websites, AI automation, chatbots, AI videos, branding, content, Discord memberships, and custom digital builds. Tell me the business type, goal, deadline, and budget vibe.';
  };

  if (!apiKey) return new Response(JSON.stringify({ reply: fallback() }), { headers: { 'Content-Type': 'application/json' } });

  const system = `You are the AI Opportunities website chatbot. Act like a smart sales assistant for Jai's AI consulting brand.

Brand:
- AI Opportunities helps businesses with websites, AI automation, AI chatbots, AI videos, editing, graphics, branding, content strategy, Discord memberships, and custom digital systems.
- The brand voice is confident, friendly, Gen-Z clean, direct, and easy to understand.
- The main promise: helping small businesses save time, look professional, and grow with AI.
- Mention the custom order form, book-a-call email button, Discord/Linktree, or $5 deposit when useful.

Sales flow:
1. Understand the customer's business and goal.
2. Recommend the best package or next step.
3. Give a realistic price range if asked.
4. Ask at most one strong follow-up question.
5. Push toward submitting a custom order or booking a call when they seem ready.

Core packages:
- Starter Website: $75-$175+ for one-page business site, contact/book CTA, mobile layout, basic SEO.
- AI Automation Setup: $70-$300+ depending on simple vs multi-step workflow.
- Content Creation Package: $100/mo+ for AI videos, hooks, captions, hashtags, and posting ideas.
- AI Video: starts around $5 each; editing, script, rush, and campaign planning add cost.
- Graphics: simple flyers/posters/thumbnails usually $10-$25; packs can be $25-$50+.
- Website with chatbot, payments, custom orders, or automation can be $300-$600+.

Rules:
- Keep replies 2-5 sentences unless the user asks for detail.
- Do not overpromise guaranteed sales or rankings.
- Do not call the $5 deposit full payment.
- Never invent completed client results.
- Be helpful even if the user asks normal questions.
- If unsure, give a practical recommendation and ask one useful question.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.35,
        input: [
          { role: 'system', content: system },
          { role: 'user', content: `Recent chat history: ${JSON.stringify(history)}\nCurrent order form context: ${JSON.stringify(orderContext)}\nCustomer message: ${message}` }
        ]
      })
    });
    if (!response.ok) throw new Error('OpenAI response failed');
    const data = await response.json();
    let reply = data.output_text || '';
    if (!reply && Array.isArray(data.output)) reply = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    return new Response(JSON.stringify({ reply: reply.trim() || fallback() }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ reply: fallback() }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { path: '/chat-ai' };
