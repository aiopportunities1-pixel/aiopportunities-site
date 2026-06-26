const STRIPE_DEPOSIT = 'https://buy.stripe.' + 'com/aFa9AS5k55eZ3vJcV78Zq0c';

function $(id){return document.getElementById(id)}
function all(sel){return Array.from(document.querySelectorAll(sel))}
function showStatus(id,msg){const el=$(id);if(el){el.style.display='block';el.innerText=msg}}
function saveStatus(msg){showStatus('formSuccess',msg)}

let selectedPackages = [];

function syncPackages(){
  const txt = selectedPackages.length ? selectedPackages.map(p => `${p.service} ($${p.amount})`).join(', ') : 'Nothing selected yet.';
  const selectedText = $('selectedPackages');
  const selectedInput = $('selectedPackagesInput');
  const prebuiltInput = $('prebuiltSelectedInput');
  const servicesInput = $('servicesInput');
  const details = $('details');
  if(selectedText) selectedText.innerText = txt;
  if(selectedInput) selectedInput.value = selectedPackages.map(p => `${p.service} - $${p.amount}`).join(', ');
  if(prebuiltInput) prebuiltInput.value = txt;
  if(servicesInput) servicesInput.value = (details && details.value.trim()) ? details.value.trim() : selectedPackages.map(p => p.service).join(', ');
}

function estimate(){
  const details = ($('details')?.value || '').toLowerCase();
  const q = Math.max(1, Number($('quantity')?.value || 1));
  let price = '';
  if(details.includes('website') && (details.includes('chatbot') || details.includes('stripe') || details.includes('automation'))) price = '$300-$600 bundle estimate';
  else if(details.includes('website')) price = '$100-$275 estimate';
  else if(details.includes('automation')) price = '$70-$300 estimate';
  else if(details.includes('video')) price = `$${q*5}-$${q*15} estimate`;
  else if(details.includes('card') || details.includes('invitation')) price = `$${Math.max(5,q)}-$${Math.max(10,q*3)} estimate`;
  else if(selectedPackages.length) price = `$${selectedPackages.reduce((s,p)=>s+(Number(p.amount)||0),0)} estimate`;
  else if(details.trim()) price = '$10-$50 estimate';
  if(price){
    const et = $('estimateText');
    const ai = $('aiReason');
    const input = $('estimatedPriceInput');
    if(et) et.innerText = `Estimated Easy Yes price: ${price}`;
    if(ai) ai.innerText = 'Final quote can change after manual review. The $5 deposit starts review and is not the full project payment.';
    if(input) input.value = price;
  }
}

function ensureHidden(form, name){
  let input = form.querySelector(`[name="${name}"]`);
  if(!input){
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    form.appendChild(input);
  }
  return input;
}

async function lookupMembershipStatus(email){
  const clean = String(email || '').trim().toLowerCase();
  if(!clean) return {tier:'Guest / Not verified', active:false, note:'No customer email entered before order details were sent.'};
  try{
    const res = await fetch(`/member-lookup?email=${encodeURIComponent(clean)}`);
    if(!res.ok) throw new Error('lookup failed');
    const data = await res.json();
    return {
      tier: data.tier || 'Guest / Not verified',
      active: !!data.active,
      email: clean,
      note: data.active ? `Verified active membership for ${clean}.` : `No active membership found for ${clean}.`
    };
  }catch(err){
    console.error(err);
    return {tier:'Guest / Not verified', active:false, email:clean, note:'Membership lookup failed before form email was sent.'};
  }
}

async function attachMembershipStatus(form){
  const email = form.querySelector('[name="email"]')?.value || '';
  const status = await lookupMembershipStatus(email);
  const tierText = status.active ? status.tier : 'Guest / Not verified';
  ensureHidden(form,'membership_status').value = tierText;
  ensureHidden(form,'membership_active').value = status.active ? 'Yes' : 'No';
  ensureHidden(form,'membership_email_checked').value = status.email || String(email || '').trim().toLowerCase();
  ensureHidden(form,'membership_note').value = status.note || '';
  ensureHidden(form,'membership_discount').value = tierText.includes('Master') ? 'Master member gets 15% off every AI Opportunities order.' : 'No Master discount verified.';
  return status;
}

async function sendNetlifyForm(form){
  const data = new FormData(form);
  if(!data.get('form-name') && form.name) data.append('form-name', form.name);
  return fetch('/', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(data).toString()
  });
}

function setupCustomOrders(){
  const form = $('orderForm');
  if(!form) return;

  all('#orderForm a[href*="buy.stripe.com"]').forEach(link => {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = link.className || 'stripe-button';
    btn.textContent = 'Submit Order & Pay $5 Deposit';
    link.replaceWith(btn);
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    syncPackages();
    estimate();
    if($('servicesInput') && $('details')) $('servicesInput').value = $('details').value;
    if($('estimatedPriceInput') && !$('estimatedPriceInput').value) $('estimatedPriceInput').value = 'Manual review needed';
    saveStatus('Checking membership status...');
    const member = await attachMembershipStatus(form);
    saveStatus(`Membership status added: ${member.active ? member.tier : 'Guest / Not verified'}. Sending order details...`);
    try{
      const res = await sendNetlifyForm(form);
      if(!res.ok) throw new Error('form failed');
      saveStatus('Order details sent with membership status. Opening deposit page...');
      window.location.href = STRIPE_DEPOSIT;
    }catch(err){
      console.error(err);
      saveStatus('Order details did not send. Try again before paying.');
    }
  }, true);
}

function setupPrebuilt(){
  all('.package-card').forEach(card => card.addEventListener('click', e => {
    e.preventDefault();
    const service = card.dataset.service;
    const amount = Number(card.dataset.price) || 5;
    const exists = selectedPackages.some(p => p.service === service);
    if(exists){ selectedPackages = selectedPackages.filter(p => p.service !== service); card.classList.remove('selected'); }
    else { selectedPackages.push({service, amount}); card.classList.add('selected'); }
    syncPackages(); estimate();
  }));
  const form = $('prebuiltForm');
  if(form) form.addEventListener('submit', async e => {
    e.preventDefault(); syncPackages();
    showStatus('prebuiltSuccess','Checking membership status...');
    const member = await attachMembershipStatus(form);
    try{
      const res = await sendNetlifyForm(form);
      if(!res.ok) throw new Error('fail');
      showStatus('prebuiltSuccess',`Service details sent with membership status: ${member.active ? member.tier : 'Guest / Not verified'}.`);
    }
    catch(err){ showStatus('prebuiltSuccess','Service details did not send. Try again.'); }
  });
}

function setupChat(){
  const chatbot = $('chatbot');
  const messages = $('chatMessages');
  const input = $('chatInput');
  const send = $('sendBtn');
  const badge = $('chatBadge');

  function hideBadge(){ if(badge) badge.style.display='none'; }
  function open(){ if(chatbot) chatbot.style.display = 'flex'; hideBadge(); }
  function close(){ if(chatbot) chatbot.style.display = 'none'; }
  function addMsg(text, cls){
    if(!messages) return;
    const div = document.createElement('div');
    div.className = cls;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function smartResponse(text){
    const lower = String(text || '').toLowerCase();
    if(lower.includes('price') || lower.includes('cost') || lower.includes('charge')) return 'Pricing depends on the project. Small edits can start low, custom websites and automations cost more. Use the order form for an Easy Yes quote.';
    if(lower.includes('website')) return 'I can help with landing pages, business websites, custom order panels, checkout buttons, and chatbot-style support.';
    if(lower.includes('automation')) return 'Automation can help with posting plans, lead capture, email workflows, reminders, and client follow-ups.';
    if(lower.includes('membership')) return 'Memberships include Discord access, resources, discounts, meetings, and priority help depending on the plan.';
    if(lower.includes('video') || lower.includes('ai video')) return 'AI videos can be promos, ads, reels, trailers, or social posts. Share your idea and style in the order form.';
    if(lower.includes('order') || lower.includes('custom')) return 'Go to Custom Orders, type exactly what you need, and submit it so AI Opportunities can review and quote it.';
    return 'I can help with AI videos, websites, automation, graphics, editing, memberships, and custom digital projects. Tell me what you need.';
  }
  function sendMessage(){
    const val = (input?.value || '').trim();
    if(!val) return;
    addMsg(val, 'user-message');
    if(input) input.value = '';
    setTimeout(() => addMsg(smartResponse(val), 'bot-message'), 250);
  }

  if($('chatToggle')) $('chatToggle').onclick = open;
  if($('openChat')) $('openChat').onclick = open;
  if($('closeChat')) $('closeChat').onclick = close;
  if(send) send.onclick = sendMessage;
  if(input) input.addEventListener('keydown', e => { if(e.key === 'Enter') sendMessage(); });
  all('.chat-quick-buttons button').forEach(btn => btn.addEventListener('click', () => {
    open();
    addMsg(btn.innerText, 'user-message');
    setTimeout(() => addMsg(smartResponse(btn.innerText), 'bot-message'), 250);
  }));
}

function setupBuddyJai(){
  const btn = $('buddyHelpBtn');
  const overlay = $('buddyOverlay');
  const closeBtn = $('buddyClose');
  const frame = $('buddyFrame');
  const homeBtn = $('buddyHomeBtn');
  const replayBtn = $('buddyReplayBtn');
  const videoSrc = 'https://drive.google.com/file/d/1Bn70InbcONTHSrXuDNMP6MT9Z_QSS8u3/preview';

  function openBuddy(){
    if(!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if(frame && !frame.src) frame.src = videoSrc;
  }
  function closeBuddy(goHome=false){
    if(!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if(frame) frame.src = '';
    if(goHome){ window.location.hash = 'home'; window.scrollTo({top:0, behavior:'smooth'}); }
  }

  if(btn) btn.addEventListener('click', openBuddy);
  if(closeBtn) closeBtn.addEventListener('click', () => closeBuddy(false));
  if(homeBtn) homeBtn.addEventListener('click', () => closeBuddy(true));
  if(replayBtn) replayBtn.addEventListener('click', () => { if(frame){ frame.src=''; setTimeout(() => frame.src = videoSrc, 100); } });
  if(overlay) overlay.addEventListener('click', e => { if(e.target === overlay) closeBuddy(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeBuddy(false); });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCustomOrders();
  setupPrebuilt();
  setupChat();
  setupBuddyJai();
  all('input, textarea, select').forEach(el => { el.addEventListener('input', () => { syncPackages(); estimate(); }); el.addEventListener('change', () => { syncPackages(); estimate(); }); });
  syncPackages(); estimate();
});
