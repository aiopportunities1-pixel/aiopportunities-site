export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const order = await req.json();
  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  const details = String(order?.details || '').toLowerCase();
  const qty = Math.max(1, Math.min(300, Number(order?.quantity || 1)));

  function categoryGuard() {
    const graphicWords = [
      'graduation card', 'grad card', 'invitation', 'invite', 'flyer', 'poster', 'thumbnail',
      'banner', 'social graphic', 'graphic', 'logo', 'simple edit', 'photo edit', 'card design'
    ];
    const isGraphic = graphicWords.some(word => details.includes(word));
    const hasHeavyAddOn = ['animation', 'animated', 'printing', 'print', 'shipping', 'website', 'automation', 'chatbot', 'stripe', 'membership', 'full package'].some(word => details.includes(word));

    if (isGraphic && !hasHeavyAddOn) {
      let price = '$10-$25 estimate';
      if (qty >= 5 && qty < 10) price = '$25-$50 estimate';
      if (qty >= 10 && qty < 20) price = '$30-$60 estimate';
      if (qty >= 20) price = '$60-$120 estimate';
      return {
        price,
        reason: `${qty} custom graphic design item${qty === 1 ? '' : 's'} should be priced as a lightweight design order, not compared to website pricing. Final quote can change after review.`,
        recommendedPackage: 'Graphic Design Order'
      };
    }

    if (details.includes('ai video') && !['edit', 'website', 'chatbot', 'automation', 'stripe', 'membership', 'marketing'].some(word => details.includes(word))) {
      const low = Math.max(5, qty * 5);
      const high = Math.max(low, qty * 10);
      return {
        price: `$${low}-$${high} estimate`,
        reason: 'AI-video-only requests use affordable per-video pricing. Editing, scripts, rush delivery, or marketing can raise the quote after review.',
        recommendedPackage: 'AI Video Order'
      };
    }

    return null;
  }

  const guarded = categoryGuard();
  if (guarded) {
    return new Response(JSON.stringify(guarded), { headers: { 'Content-Type': 'application/json' } });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({
      price: '$25-$75 estimate',
      reason: 'Manual review needed. Easy Yes starter pricing used. Final quote can change after review.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const prompt = `You are the AI Opportunities pricing assistant. Return ONLY valid JSON with exactly these keys: "price", "reason", "recommendedPackage".

Main goal: Easy Yes pricing. Keep quotes affordable, realistic, and category-specific. NEVER compare one service category to another category. A graphic design order is not a website. A card/flyer/poster/logo order is not an automation. A website quote is only for actual websites.

Client request:
${JSON.stringify(order)}

FIRST classify the request into exactly one category:
1. Graphic Design: graduation cards, invitations, flyers, posters, thumbnails, logos, simple edits, banners, social graphics.
2. AI Video.
3. Website.
4. Automation.
5. Chatbot / custom order panel / memberships / payments.
6. Full bundle.

Easy Yes pricing menu:
GRAPHIC DESIGN ONLY:
- 1 simple design/card/flyer/poster/thumbnail/banner: $10-$25.
- 5 designs/cards: $25-$50.
- 10 designs/cards: $30-$60.
- 20+ designs/cards: $60-$120 unless printing/shipping/animation is requested.
- Heavy photo manipulation: add $10-$40.
- Rush delivery: add $10-$25.
- NEVER quote $100-$175 for 10 graduation cards unless premium animation, printing, shipping, or a full event package is requested.
- NEVER mention website pricing inside a graphic design reason.

AI VIDEO:
- AI video only: $5 per video.
- AI video with editing/script/marketing: $15-$35 each or custom package.

AUTOMATION:
- Basic automation with little detail: $75-$125.
- One-platform social media automation starter: $70-$125.
- 3 social accounts automation starter: $125-$200.
- Automation with posting/content help: $150-$250.
- Basic email auto reply or simple workflow: $100-$175.
- Custom multi-step automation: $175-$300.

WEBSITES:
- Basic one-page website: $100-$175.
- Simple business website: $150-$225.
- Professional business website: $200-$275.
- Luxury-looking business website with Stripe payment link: $225-$300.

AI SYSTEM ADD-ONS:
- Chatbot setup by itself: $150-$250.
- Custom order panel by itself: $150-$250.
- Membership/payment setup by itself: $150-$250.
- Website with chatbot or custom order panel is a bundle: $300-$450.
- Website with chatbot plus custom order panel plus memberships/payments is a bigger bundle: $400-$600.
- Full digital business setup: $600+ only if they ask for many different services together.

Hard rules:
- Identify the category first and price ONLY from that category.
- One single thing maxes at $300.
- Only quote above $300 when the user clearly asks for multiple separate services together.
- If request is vague, use the lower half of the correct category range.
- Never say undefined.
- Always say final quote can change after review.
- The $5 deposit starts review only; it is not full payment.
- Keep reason short, human, and specific to the request.

Response style:
- price examples: "$30-$60 estimate", "$75-$125 estimate", "$225-$300 estimate", "$300-$450 bundle estimate".
- recommendedPackage examples: Graphic Design Order, AI Video Order, Starter Automation, Social Media Automation, Basic Business Website, Luxury Website + Stripe, Website + AI Systems, Full Digital Setup.`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt, temperature: 0.02 })
    });
    if (!response.ok) throw new Error('bad response');

    const data = await response.json();
    let text = data.output_text || '';
    if (!text && Array.isArray(data.output)) {
      text = data.output.flatMap(item => item.content || []).map(part => part.text || '').join('');
    }

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify({
      price: parsed.price || '$25-$75 estimate',
      reason: parsed.reason || 'Easy Yes estimate. Final quote can change after review. The $5 deposit starts review only.',
      recommendedPackage: parsed.recommendedPackage || 'Custom Digital Package'
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({
      price: '$25-$75 estimate',
      reason: 'Manual review needed. Easy Yes starter pricing used. Final quote can change after review. The $5 deposit starts review only.',
      recommendedPackage: 'Manual Quote Required'
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { path: '/quote-ai' };
