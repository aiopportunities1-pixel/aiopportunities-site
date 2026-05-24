export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$100+ one-time',
      reason: 'OPENAI_API_KEY missing in Netlify environment variables. Manual quote needed so the business does not undercharge.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const order = await req.json();

  const prompt = `You are the AI Opportunities pricing assistant. Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

Your main job is to protect the business from undercharging while still keeping prices Easy Yes and affordable. The customer's selected budget is NOT the final price. It is only their preferred range. Calculate price based on workload, deliverables, complexity, turnaround speed, add-ons, video count, website features, chatbot/custom panel/membership setup, and marketing work.

The client request is:
${JSON.stringify(order)}

Hard pricing rules:
- Do NOT let the customer's selected budget control the final price.
- Do NOT discount automatically.
- Do NOT say a project fits the selected budget unless the calculated price is actually inside that range.
- If the selected budget is too low, clearly say it does not fully cover the request and offer a smaller budget version.
- Simple edit: $25 minimum.
- Basic video edit: $15 per video minimum.
- AI video: $25 per video minimum.
- 10 edited videos: $150 minimum.
- Basic one-page starter website: $100 minimum. This is the lowest allowed website price.
- Basic one-page website with light personalization: $100-$150 one-time.
- Professional business website: $200 minimum.
- Custom branded website: $250 minimum.
- Website with chatbot, custom order panel, or memberships: $400 minimum.
- Website plus video editing package: $350 minimum.
- Chatbot setup: $250 minimum.
- Automation setup: $250 minimum.
- Full digital business setup: $750 minimum.
- Rush delivery: add $50-$150.
- Marketing strategy or campaign setup: add $100-$300.
- Never price any website under $100.
- Never price a professional business website under $200.
- Never price 10 edited videos under $150.
- Never price a website plus videos under $350.
- Never price chatbot, automation, membership setup, or custom order system under $250.
- If someone asks for a basic website only, quote around $100-$150 one-time.
- If someone asks for a professional business website, quote $200-$300+ one-time.
- If someone asks for a fast custom website, watermark/branding, marketing videos, and 10 edited videos, quote $400-$550+ one-time even if they selected a low budget.

Budget handling:
- Starter Budget means roughly $100-$250.
- Standard Budget means roughly $250-$500.
- Premium Budget means roughly $500-$1,000.
- Big Project means $1,000+.
- If the order mentions $5-$100 or any tiny budget, basic website can still be $100, but professional websites, automation, chatbot, memberships, or 10+ videos must be higher.

Response rules:
- price: Give the real calculated price, such as "$100-$150 one-time", "$200-$300 one-time", "$400-$550 one-time", or "$150-$250/week".
- reason: Keep it short but include a budget check if their budget is too low.
- recommendedPackage: Use a package name like "Basic Starter Website", "Professional Business Website", "Custom Website + Video Package", "Automation Setup", or "Full Digital Business Setup".
- Always protect the business.
- Never return undefined.`;

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
        temperature: 0.1
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        price: '$100+ one-time',
        reason: 'Manual review needed. Backup pricing uses the business website minimum instead of undercharging.',
        recommendedPackage: 'Manual Quote Required'
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
      price: parsed.price || '$100+ one-time',
      reason: parsed.reason || 'AI reviewed the order using business-safe minimum pricing so the request does not get undercharged.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$100+ one-time',
      reason: 'Manual review needed. Backup pricing uses the business minimum instead of a low automatic quote.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = {
  path: '/quote-ai'
};
