export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const order = await req.json().catch(() => ({}));
  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  const details = String(order?.details || '').toLowerCase();
  const qty = Math.max(1, Math.min(300, Number(order?.quantity || 1)));
  const timeline = String(order?.timeline || 'no-rush').toLowerCase();
  const selected = Array.isArray(order?.selected) ? order.selected : [];

  function hasAny(words) {
    return words.some(word => details.includes(word));
  }

  function rushFee() {
    if (timeline.includes('same')) return 15;
    if (timeline.includes('two')) return 10;
    if (timeline.includes('fast')) return 5;
    return 0;
  }

  function range(low, high, label = 'estimate') {
    const fee = rushFee();
    return `$${low + fee}-$${high + fee} ${label}`;
  }

  function fixedPricingBrain() {
    const isCard = hasAny(['graduation card', 'grad card', 'card', 'cards', 'invitation', 'invite']);
    const isGraphic = isCard || hasAny(['flyer', 'poster', 'thumbnail', 'banner', 'social graphic', 'graphic', 'logo', 'simple edit', 'photo edit', 'card design']);
    const isBasic = hasAny(['basic', 'simple', 'template', 'name swap', 'photo swap', 'basic card', 'basic cards']);
    const isPremium = hasAny(['premium', 'cinematic', 'animated', 'animation', 'motion', 'heavy edit', 'advanced', 'effects', 'vfx']);
    const isPrinted = hasAny(['printing', 'print', 'shipping', 'ship', 'physical', 'mailed']);
    const hasSystemAddOn = hasAny(['website', 'automation', 'chatbot', 'stripe', 'membership', 'payment', 'custom order panel', 'full package']);

    if (isCard && !hasSystemAddOn && !isPrinted) {
      if (isPremium) {
        const low = Math.max(15, qty * 4);
        const high = Math.max(low + 10, qty * 6);
        return {
          price: range(low, high),
          reason: `${qty} premium/custom card${qty === 1 ? '' : 's'} with heavier design should be priced higher than basic cards, but still as graphic design — not website pricing. Final quote can change after review.`,
          recommendedPackage: 'Premium Card Design'
        };
      }

      if (isBasic) {
        const low = Math.max(5, qty * 1);
        const high = Math.max(low + 5, qty * 2);
        return {
          price: range(low, high),
          reason: `${qty} basic card${qty === 1 ? '' : 's'} should be priced like a simple template/name/photo swap. Final quote can change after review.`,
          recommendedPackage: 'Basic Card Design'
        };
      }

      const low = Math.max(10, Math.round(qty * 2));
      const high = Math.max(low + 5, Math.round(qty * 3.5));
      return {
        price: range(low, high),
        reason: `${qty} custom card${qty === 1 ? '' : 's'} should be priced as simple personalized graphic work. Final quote can change after review.`,
        recommendedPackage: 'Custom Card Design'
      };
    }

    if (isGraphic && !hasSystemAddOn && !isPrinted) {
      if (isPremium) return { price: range(35, 75), reason: 'This is premium graphic/editing work, so the estimate is higher than a basic design. Final quote can change after review.', recommendedPackage: 'Premium Graphic Design' };
      if (qty >= 5) return { price: range(20, 50), reason: 'This is a small pack of simple graphic designs, so it uses affordable bundle pricing. Final quote can change after review.', recommendedPackage: 'Graphic Design Pack' };
      return { price: range(10, 25), reason: 'This is a simple graphic design request, so it should stay affordable. Final quote can change after review.', recommendedPackage: 'Simple Graphic Design' };
    }

    if (details.includes('ai video') && !hasAny(['website', 'chatbot', 'automation', 'stripe', 'membership'])) {
      if (hasAny(['edit', 'editing', 'script', 'marketing', 'caption'])) return { price: range(qty * 15, qty * 35), reason: 'AI videos with editing, scripts, or marketing cost more than AI-video-only. Final quote can change after review.', recommendedPackage: 'AI Video + Editing' };
      return { price: range(qty * 5, qty * 10), reason: 'AI-video-only requests use simple per-video pricing. Final quote can change after review.', recommendedPackage: 'AI Video Order' };
    }

    if (hasAny(['website']) && hasAny(['chatbot', 'custom order', 'membership', 'payment', 'stripe', 'automation'])) {
      return { price: range(300, 600, 'bundle estimate'), reason: 'This includes a website plus extra AI/payment/order systems, so it is a bundle instead of a single small service. Final quote can change after review.', recommendedPackage: 'Website + AI Systems' };
    }

    if (hasAny(['website'])) {
      if (hasAny(['business', 'professional'])) return { price: range(150, 275), reason: 'This is website work, so it uses website pricing instead of graphic pricing. Final quote can change after review.', recommendedPackage: 'Business Website' };
      return { price: range(100, 175), reason: 'This is a starter website estimate. Final quote can change after review.', recommendedPackage: 'Starter Website' };
    }

    if (hasAny(['automation', 'workflow', 'auto reply', 'social media automation'])) {
      if (hasAny(['multi-step', 'custom', 'posting', 'content'])) return { price: range(175, 300), reason: 'This sounds like custom automation, so it uses automation pricing. Final quote can change after review.', recommendedPackage: 'Custom Automation' };
      return { price: range(70, 125), reason: 'This sounds like starter automation. Final quote can change after review.', recommendedPackage: 'Starter Automation' };
    }

    if (selected.length) {
      const total = selected.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      if (total > 0) return { price: `$${total} estimate`, reason: 'This estimate is based on the selected prebuilt services. Final quote can change after review.', recommendedPackage: 'Selected Package' };
    }

    return null;
  }

  const fixed = fixedPricingBrain();
  if (fixed) {
    return new Response(JSON.stringify(fixed), { headers: { 'Content-Type': 'application/json' } });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$10-$50 estimate',
      reason: 'Manual review needed. Easy Yes starter pricing used. Final quote can change after review.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const prompt = `Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

You are the AI Opportunities pricing assistant. Classify the request before pricing. Use easy yes pricing. Never compare unrelated categories.

Request: ${JSON.stringify(order)}

Strict menu:
- 10 basic cards: $10-$20.
- 10 custom simple cards: $20-$35.
- 10 premium/heavy cards: $40-$60.
- Basic/simple card: $1-$2 each, minimum $5.
- Custom simple card: $2-$4 each, minimum $10.
- Premium card: $4-$6 each, minimum $15.
- One simple flyer/poster/banner/thumbnail/logo: $10-$25.
- Small graphic pack: $20-$50.
- Premium graphic/edit: $35-$75.
- AI video only: $5-$10 each.
- AI video with editing/script/marketing: $15-$35 each.
- Starter website: $100-$175.
- Business website: $150-$275.
- Website plus chatbot/payment/custom order/membership: $300-$600 bundle estimate.
- Starter automation: $70-$125.
- Custom automation: $175-$300.

Hard rules:
- Graphic/card orders are never website prices.
- Basic is cheaper than custom. Custom is cheaper than premium.
- Never quote $30-$60 for 10 basic cards.
- Never quote $100+ for card/graphic orders unless printing, shipping, animation, or a full event package is requested.
- Always mention final quote can change after review.
- The $5 deposit starts review only; it is not full payment.
- Keep reason short and human.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt, temperature: 0.01 })
    });
    if (!response.ok) throw new Error('bad response');
    const data = await response.json();
    let text = data.output_text || '';
    if (!text && Array.isArray(data.output)) text = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify({
      price: parsed.price || '$10-$50 estimate',
      reason: parsed.reason || 'Easy Yes estimate. Final quote can change after review. The $5 deposit starts review only.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$10-$50 estimate',
      reason: 'Manual review needed. Easy Yes starter pricing used. Final quote can change after review. The $5 deposit starts review only.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { path: '/quote-ai' };
