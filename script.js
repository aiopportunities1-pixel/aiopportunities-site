const chatToggle=document.getElementById('chatToggle');
const chatbot=document.getElementById('chatbot');
const closeChat=document.getElementById('closeChat');
const openChat=document.getElementById('openChat');

if(chatToggle){
  chatToggle.innerHTML='AI Chat <span id="chatBadge" class="chat-badge" style="display:none">1</span>';
}
const chatBadge=document.getElementById('chatBadge');
function showChatBadge(){if(chatBadge&&(!chatbot||chatbot.style.display!=='flex'))chatBadge.style.display='inline-flex'}
function hideChatBadge(){if(chatBadge)chatBadge.style.display='none'}
function openChatBox(){if(chatbot)chatbot.style.display='flex';hideChatBadge()}
function closeChatBox(){if(chatbot)chatbot.style.display='none'}
if(chatToggle)chatToggle.onclick=openChatBox;
if(closeChat)closeChat.onclick=closeChatBox;
if(openChat)openChat.onclick=openChatBox;

const messages=document.getElementById('chatMessages');
const input=document.getElementById('chatInput');
const send=document.getElementById('sendBtn');
function addMsg(msg,cls){if(!messages)return;const div=document.createElement('div');div.className=cls;div.innerText=msg;messages.appendChild(div);messages.scrollTop=messages.scrollHeight}
function botReply(msg){addMsg(msg,'bot-message')}
function userReply(msg){addMsg(msg,'user-message')}
function smartResponse(text){
  const lower=String(text||'').toLowerCase();
  if(lower.includes('price'))return 'I can estimate it, but big projects need scope first. Websites start at $100, business websites start at $200, and systems like chatbot/custom order/memberships start higher.';
  if(lower.includes('membership'))return 'Supporter is $20/mo, Supporter+ is $25/mo, and Master is $35/mo. Perks unlock through Discord.';
  if(lower.includes('website'))return 'A basic website starts around $100-$150. A professional business website starts around $200-$300+. If you need chatbot, payments, memberships, or a custom order panel, expect $400+.';
  if(lower.includes('automation'))return 'Automation depends on the setup. One-platform starter automation can start at $70, but full custom automations usually start around $250+.';
  if(lower.includes('video'))return 'AI videos are $5 each if it is AI-video-only. Editing, scripts, marketing, rush delivery, or packages cost more.';
  return 'I can help with AI videos, websites, automations, branding, editing, memberships, and custom orders. Tell me what you need and I will help scope it.';
}
if(send){send.onclick=()=>{const val=input.value.trim();if(!val)return;userReply(val);setTimeout(()=>botReply(smartResponse(val)),350);input.value=''}}
if(input){input.addEventListener('keydown',e=>{if(e.key==='Enter'&&send)send.click()})}
document.querySelectorAll('.chat-quick-buttons button').forEach(btn=>{btn.onclick=()=>{userReply(btn.innerText);setTimeout(()=>botReply(smartResponse(btn.innerText)),350)}});

const form=document.getElementById('orderForm');
const estimateText=document.getElementById('estimateText');
const aiReason=document.getElementById('aiReason');
const success=document.getElementById('formSuccess');
const estimateInput=document.getElementById('estimatedPriceInput');
const selectedPackagesInput=document.getElementById('selectedPackagesInput');
const servicesInput=document.getElementById('servicesInput')||document.getElementById('selectedServicesInput');
const selectedPackagesText=document.getElementById('selectedPackages');
const prebuiltBuyNow=document.getElementById('prebuiltBuyNow');
const clearCartBtn=document.getElementById('clearCart');
const customDepositLink='https://buy.stripe.com/aFa9AS5k55eZ3vJcV78Zq0c';
let selectedPackages=[];
let quoteTimer;

function getProfile(){try{return JSON.parse(localStorage.getItem('aiopp_profile')||'{}')}catch(e){return{}}}
function setProfile(profile){localStorage.setItem('aiopp_profile',JSON.stringify(profile||{}))}
function detectMemberStatus(){const p=getProfile();return p.memberStatus||localStorage.getItem('aiopp_member_status')||'Guest / Not verified'}
function deliveryFee(){const t=document.getElementById('timeline')?.value||'no-rush';if(t==='fast')return 5;if(t==='two-day')return 10;if(t==='same-day')return 15;return 0}
function getBudgetInfo(){const b=document.getElementById('budget')?.value||'starter';if(b==='starter')return{label:'$5-$100',min:5,max:100};if(b==='serious')return{label:'$100-$300',min:100,max:300};return{label:'$300+',min:300,max:999999}}
function priceNumber(price){const m=String(price||'').match(/\$\s*(\d+)/);return m?Number(m[1]):0}
function detailsText(){return String(document.getElementById('details')?.value||'').toLowerCase()}
function quantity(){return Math.max(1,Math.min(300,Number(document.getElementById('quantity')?.value||1)))}
function frequency(){return document.getElementById('frequency')?.value||'one-time'}
function isAiVideoOnly(details){return details.includes('ai video')&&!details.includes('edit')&&!details.includes('website')&&!details.includes('chatbot')&&!details.includes('automation')&&!details.includes('stripe')&&!details.includes('membership')&&!details.includes('marketing')}
function needsQuestions(details){return details.includes('website')||details.includes('business')||details.includes('automation')||details.includes('social media')||details.includes('chatbot')||details.includes('custom order')||details.includes('membership')||details.includes('stripe')||details.includes('payment')||details.includes('account')}
function scopeQuestions(details){
  const qs=[];
  if(details.includes('website')||details.includes('business'))qs.push('How many pages do you need?');
  if(details.includes('website')||details.includes('chatbot')||details.includes('custom order')||details.includes('membership')||details.includes('stripe'))qs.push('Do you need chatbot, Stripe/payment links, memberships, or a custom order panel?');
  if(details.includes('social media')||details.includes('account')||details.includes('content'))qs.push('How many posts or videos per week do you want created and posted?');
  if(details.includes('automation'))qs.push('Do you want full automation setup, posting help, or both?');
  if(!qs.length)qs.push('How many deliverables do you need?');
  return qs.slice(0,3);
}
function localQuote(){
  const q=quantity();
  const freq=frequency();
  const details=detailsText();
  let total=0;
  if(selectedPackages.length)selectedPackages.forEach(p=>total+=(Number(p.amount)||5)*q);
  if(isAiVideoOnly(details)) total=Math.max(total,5*q);
  if(details.includes('simple edit')||details.includes('graphic')||details.includes('flyer')||details.includes('poster'))total=Math.max(total,25);
  if(details.includes('editing')||details.includes('edited video'))total=Math.max(total,15*q);
  if(details.includes('10 edited')||details.includes('ten edited'))total=Math.max(total,150);
  if(details.includes('basic website')||details.includes('one-page')||details.includes('starter website'))total=Math.max(total,100);
  if(details.includes('business website')||details.includes('professional website'))total=Math.max(total,200);
  if(details.includes('custom branded website'))total=Math.max(total,250);
  if(details.includes('website'))total=Math.max(total,100);
  if(details.includes('chatbot')||details.includes('automation')||details.includes('membership')||details.includes('memberships')||details.includes('stripe')||details.includes('payment')||details.includes('custom order'))total=Math.max(total,250);
  if(details.includes('website')&&(details.includes('chatbot')||details.includes('automation')||details.includes('membership')||details.includes('stripe')||details.includes('payment')||details.includes('custom order')))total=Math.max(total,400);
  if(details.includes('full digital')||details.includes('everything')||details.includes('all of it'))total=Math.max(total,750);
  if(details.includes('social media accounts')||details.includes('3 social')||details.includes('three social')||details.includes('tiktok instagram')||details.includes('linked in')||details.includes('linkedin'))total=Math.max(total,250);
  if(details.includes('you create the content')||details.includes('you market it')||details.includes('market it'))total=Math.max(total,300);
  if(!total)total=25;
  total+=deliveryFee();
  total=Math.max(5,Math.round(total/5)*5);
  if(freq==='weekly'||freq==='twice-weekly'||freq==='daily')return `$${total}/week estimate`;
  if(freq==='monthly')return `$${total}/mo estimate`;
  return `$${total} one-time estimate`;
}
function budgetNote(price){
  const total=priceNumber(price);const info=getBudgetInfo();
  if(info.max!==999999&&total>info.max)return ` This is over the selected ${info.label} budget because the scope is bigger than a starter request. A smaller version can be quoted manually.`;
  if(total>=info.min&&total<=info.max)return ` This fits the selected ${info.label} budget.`;
  if(total<info.min)return ` This is below your selected ${info.label} budget, so you could keep it simple or add upgrades.`;
  return ' Final quote may change after review.';
}
function addApprovalButton(price){
  let btn=document.getElementById('approveQuoteBtn');
  if(!btn){btn=document.createElement('a');btn.id='approveQuoteBtn';btn.className='glow-btn';btn.style.marginTop='18px';btn.style.display='inline-block';btn.target='_blank';document.querySelector('.estimate-box')?.appendChild(btn)}
  btn.href=customDepositLink;btn.innerText='Start review with $5 deposit';
}
function showQuestions(questions){
  if(!questions||!questions.length)return;
  const msg='I need a little more info before this can be a final quote: '+questions.join(' ');
  botReply(msg);showChatBadge();
}
function syncPackages(){
  const txt=selectedPackages.length?selectedPackages.map(p=>`${p.service} ($${p.amount})`).join(', '):'Nothing selected yet.';
  if(selectedPackagesText)selectedPackagesText.innerText=txt;
  if(selectedPackagesInput)selectedPackagesInput.value=selectedPackages.map(p=>`${p.service} - $${p.amount}`).join(', ');
  const details=document.getElementById('details')?.value.trim()||'';
  if(servicesInput)servicesInput.value=details||selectedPackages.map(p=>p.service).join(', ');
  updateBuyNow();
}
function saveForm(){
  ['quantity','frequency','timeline','budget','details'].forEach(id=>{const el=document.getElementById(id);if(el)localStorage.setItem('aiopp_'+id,el.value)});
  document.querySelectorAll('input[name="name"],input[name="email"]').forEach(el=>localStorage.setItem('aiopp_'+el.name,el.value));
  const name=document.querySelector('input[name="name"]')?.value.trim();const email=document.querySelector('input[name="email"]')?.value.trim();const old=getProfile();
  if(name||email)setProfile({name:name||old.name||'',email:email||old.email||'',memberStatus:old.memberStatus||detectMemberStatus()});
  localStorage.setItem('aiopp_packages',JSON.stringify(selectedPackages));
}
function applySaved(){
  ['quantity','frequency','timeline','budget','details'].forEach(id=>{const el=document.getElementById(id);const val=localStorage.getItem('aiopp_'+id);if(el&&val)el.value=val});
  document.querySelectorAll('input[name="name"],input[name="email"]').forEach(el=>{const val=localStorage.getItem('aiopp_'+el.name);if(val)el.value=val});
  try{selectedPackages=JSON.parse(localStorage.getItem('aiopp_packages')||'[]')}catch(e){selectedPackages=[]}
  document.querySelectorAll('.package-card').forEach(card=>{card.classList.toggle('selected',selectedPackages.some(p=>p.service===card.dataset.service))});
  syncPackages();
}
function updateBuyNow(){
  if(!prebuiltBuyNow)return;
  if(!selectedPackages.length){prebuiltBuyNow.href='#prebuilt';prebuiltBuyNow.innerText='Buy Now';return}
  const total=selectedPackages.reduce((sum,p)=>sum+(Number(p.amount)||0),0);
  prebuiltBuyNow.href='#checkout';prebuiltBuyNow.innerText=selectedPackages.length===1?`Buy ${selectedPackages[0].service} - $${total}`:`Buy Selected - $${total}`;
}
async function goToPrebuiltCheckout(){
  if(!selectedPackages.length){alert('Pick at least one prebuilt service first.');return}
  const total=selectedPackages.reduce((sum,p)=>sum+(Number(p.amount)||0),0);
  prebuiltBuyNow.innerText='Creating checkout...';
  try{
    const res=await fetch('/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:selectedPackages,customer:getProfile(),memberStatus:detectMemberStatus()})});
    const data=await res.json();
    if(data.url){window.location.href=data.url;return}
    alert(data.error||'Checkout could not be created.');
  }catch(e){alert('Checkout could not be created. Make sure Stripe is connected.');}
  finally{prebuiltBuyNow.innerText=`Buy Selected - $${total}`}
}
if(prebuiltBuyNow)prebuiltBuyNow.addEventListener('click',e=>{e.preventDefault();goToPrebuiltCheckout()});
if(clearCartBtn)clearCartBtn.addEventListener('click',e=>{e.preventDefault();selectedPackages=[];localStorage.removeItem('aiopp_packages');document.querySelectorAll('.package-card').forEach(card=>card.classList.remove('selected'));syncPackages();updateEstimate()});
document.querySelectorAll('.package-card').forEach(card=>{card.addEventListener('click',e=>{e.preventDefault();const service=card.dataset.service;const amount=Number(card.dataset.price)||5;const exists=selectedPackages.find(p=>p.service===service);if(exists){selectedPackages=selectedPackages.filter(p=>p.service!==service);card.classList.remove('selected')}else{selectedPackages.push({service,amount});card.classList.add('selected')}syncPackages();saveForm();updateEstimate()})});
async function updateEstimate(){
  clearTimeout(quoteTimer);
  quoteTimer=setTimeout(async()=>{
    syncPackages();saveForm();
    const details=document.getElementById('details')?.value||'';
    if(!details.trim()&&!selectedPackages.length){if(estimateText)estimateText.innerText='Type your request or pick a prebuilt service. Real AI will create an Easy Yes price.';if(aiReason)aiReason.innerText='The quote uses the custom request, selected packages, quantity, frequency, delivery speed, and budget.';return}
    if(estimateText)estimateText.innerText='AI is creating your Easy Yes price...';
    if(aiReason)aiReason.innerText='Checking scope, quantity, timeline, budget, and protected minimums.';
    let finalPrice=localQuote();let reason='Protected estimate based on your details, quantity, timeline, and business minimum pricing.';let questions=[];
    try{
      const res=await fetch('/quote-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selected:selectedPackages,quantity:quantity(),frequency:frequency(),timeline:document.getElementById('timeline')?.value||'no-rush',budget:document.getElementById('budget')?.value||'starter',details,deliveryFee:deliveryFee(),customer:getProfile(),memberStatus:detectMemberStatus()})});
      const data=await res.json();
      if(data.price&&priceNumber(data.price)>=priceNumber(finalPrice))finalPrice=data.price;
      if(data.reason)reason=data.reason;
      if(Array.isArray(data.questions))questions=data.questions;
    }catch(e){}
    if(needsQuestions(details)&&!questions.length)questions=scopeQuestions(details);
    if(estimateText)estimateText.innerText=`Estimated Easy Yes price: ${finalPrice}`;
    if(aiReason)aiReason.innerText=reason+' '+budgetNote(finalPrice)+' Final quote can change after manual review. The $5 deposit only starts review, it is not the full project payment.';
    if(estimateInput)estimateInput.value=finalPrice;
    addApprovalButton(finalPrice);
    if(questions.length)showQuestions(questions);
  },450);
}
document.querySelectorAll('input,textarea,select').forEach(el=>{el.addEventListener('change',updateEstimate);el.addEventListener('input',updateEstimate);el.addEventListener('input',saveForm)});
if(form){form.addEventListener('submit',async e=>{e.preventDefault();syncPackages();saveForm();await updateEstimate();const data=new FormData(form);data.append('member_status',detectMemberStatus());try{await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()});if(success){success.style.display='block';success.innerText='Order submitted. The $5 deposit starts review, and the final quote may change after manual review.'}}catch(err){if(success){success.style.display='block';success.innerText='Order saved on this page. Try submitting again or email the details.'}}})}
applySaved();updateEstimate();
