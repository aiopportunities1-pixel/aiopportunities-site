export default async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ price: '$75-$150 estimate', reason: 'Manual review needed. Starter Easy Yes pricing used.', recommendedPackage: 'Manual Quote Required' }), { headers: { 'Content-Type': 'application/json' } });
  const order = await req.json();
  const prompt = `You are the AI Opportunities pricing assistant. Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

Main goal: Easy Yes pricing. Keep quotes affordable and realistic. Do not scare customers with near-$1,000 prices unless they ask for a full business setup with many systems.

Client request:
${JSON.stringify(order)}

Easy Yes pricing menu:
- AI video only: $5 per video.
- Logo, flyer, poster, captions, simple graphic: $10-$35.
- Simple edit: $15-$35.
- Starter content strategy: $20-$50.
- Starter automation with little detail: $75-$125.
- One-platform social media automation starter: $70-$125.
- 3 social accounts automation starter: $125-$200.
- Automation with posting/content help: $150-$250.
- Basic email auto reply or simple workflow: $100-$175.
- Custom multi-step automation: $175-$300.
- Basic one-page website: $100-$175.
- Simple business website: $150-$250.
- Professional business website: $200-$350.
- Luxury-looking business website with Stripe payment link: $250-$400.
- Website with chatbot or custom order panel: $300-$450.
- Website with chatbot plus custom order panel plus memberships/payments: $400-$600.
- Full digital business setup: $600+ only if they ask for everything.

Rules:
- Use the lower half of ranges when the request is vague or the budget is starter.
- If the request says luxury website with Stripe, quote around $250-$350, not $500+.
- If the request just says automation, quote $75-$125, not $250.
- If the request includes multiple platforms and posting help, quote $150-$250.
- Never quote a website below $100.
- Never quote chatbot/custom order panel below $250.
- Make the quote sound like an estimate and say final quote can change after review.
- If budget is too low, say a smaller starter version is available.
- Do not say undefined.

Response style:
- price examples: "$75-$125 estimate", "$150-$250 estimate", "$250-$350 estimate", "$300-$450 estimate".
- reason: short and friendly.
- recommendedPackage: Starter Automation, Social Media Automation, Basic Business Website, Luxury Website + Stripe, Website + AI Systems, or Full Digital Setup.`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt, temperature: 0.05 }) });
    if (!response.ok) throw new Error('bad response');
    const data = await response.json();
    let text = data.output_text || '';
    if (!text && Array.isArray(data.output)) text = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify({ price: parsed.price || '$75-$150 estimate', reason: parsed.reason || 'Easy Yes estimate. Final quote can change after review.', recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ price: '$75-$150 estimate', reason: 'Manual review needed. Easy Yes starter pricing used.', recommendedPackage: 'Manual Quote Required' }), { headers: { 'Content-Type': 'application/json' } });
  }
};
export const config = { path: '/quote-ai' };
