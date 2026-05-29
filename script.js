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
    saveStatus('Sending order details first...');
    try{
      const res = await sendNetlifyForm(form);
      if(!res.ok) throw new Error('form failed');
      saveStatus('Order details sent. Opening deposit page...');
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
    try{ const res = await sendNetlifyForm(form); if(!res.ok) throw new Error('fail'); showStatus('prebuiltSuccess','Service details sent.'); }
    catch(err){ showStatus('prebuiltSuccess','Service details did not send. Try again.'); }
  });
}

function setupChat(){
  const chatbot = $('chatbot');
  const open = () => { if(chatbot) chatbot.style.display = 'flex'; };
  const close = () => { if(chatbot) chatbot.style.display = 'none'; };
  if($('chatToggle')) $('chatToggle').onclick = open;
  if($('openChat')) $('openChat').onclick = open;
  if($('closeChat')) $('closeChat').onclick = close;
}

document.addEventListener('DOMContentLoaded', () => {
  setupCustomOrders();
  setupPrebuilt();
  setupChat();
  all('input, textarea, select').forEach(el => { el.addEventListener('input', () => { syncPackages(); estimate(); }); el.addEventListener('change', () => { syncPackages(); estimate(); }); });
  syncPackages(); estimate();
});
