const chatToggle=document.getElementById('chatToggle');
const chatbot=document.getElementById('chatbot');
const closeChat=document.getElementById('closeChat');
const openChat=document.getElementById('openChat');

if(chatToggle){chatToggle.innerHTML='AI Chat <span id="chatBadge" class="chat-badge" style="display:none">1</span>'}
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
  if(lower.includes('price')||lower.includes('charge')||lower.includes('cost'))return 'Use the estimator below for the smartest quote. Basic cards stay cheap, custom work costs more, and full website/AI systems are priced separately.';
  if(lower.includes('membership'))return 'Supporter is $20/mo, Supporter+ is $25/mo, and Master is $35/mo. Perks unlock through Discord.';
  if(lower.includes('website'))return 'A starter website starts around $100-$175. Business websites and AI systems cost more depending on pages and features.';
  if(lower.includes('automation'))return 'Starter automation can be $70-$125. Custom multi-step automation is usually $175-$300.';
  if(lower.includes('video'))return 'AI-video-only starts around $5-$10 each. Editing, scripts, and marketing cost more.';
  return 'I can help with AI videos, websites, automations, graphics, editing, memberships, and custom orders. Tell me what you need and I will help scope it.';
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
let lastEstimate='';

function getProfile(){try{return JSON.parse(localStorage.getItem('aiopp_profile')||'{}')}catch(e){return{}}}
function setProfile(profile){localStorage.setItem('aiopp_profile',JSON.stringify(profile||{}))}
function detectMemberStatus(){const p=getProfile();return p.memberStatus||localStorage.getItem('aiopp_member_status')||'Guest / Not verified'}
function deliveryFee(){const t=document.getElementById('timeline')?.value||'no-rush';if(t==='fast')return 5;if(t==='two-day')return 10;if(t==='same-day')return 15;return 0}
function getBudgetInfo(){const b=document.getElementById('budget')?.value||'starter';if(b==='starter')return{label:'$5-$100',min:5,max:100};if(b==='serious')return{label:'$100-$300',min:100,max:300};return{label:'$300+',min:300,max:999999}}
function priceNumber(price){const matches=String(price||'').match(/\d+/g);return matches?Number(matches[0]):0}
function detailsText(){return String(document.getElementById('details')?.value||'').toLowerCase()}
function quantity(){return Math.max(1,Math.min(300,Number(document.getElementById('quantity')?.value||1)))}
function frequency(){return document.getElementById('frequency')?.value||'one-time'}
function hasAny(details,words){return words.some(w=>details.includes(w))}
function addFeeToRange(low,high,label='estimate'){const fee=deliveryFee();return `$${low+fee}-$${high+fee} ${label}`}
function localQuote(){
  const q=quantity();
  const details=detailsText();
  if(!details.trim()&&!selectedPackages.length)return '';

  const isCard=hasAny(details,['graduation card','grad card','cards','card','invitation','invite']);
  const isBasic=hasAny(details,['basic','simple','template','name swap','photo swap']);
  const isPremium=hasAny(details,['premium','cinematic','animated','animation','motion','heavy','advanced','effects','vfx']);
  const hasSystem=hasAny(details,['website','automation','chatbot','stripe','membership','payment','custom order panel','full package']);
  const isPrinted=hasAny(details,['printing','print','shipping','ship','physical','mailed']);

  if(isCard&&!hasSystem&&!isPrinted){
    if(isPremium)return addFeeToRange(Math.max(15,q*4),Math.max(25,q*6));
    if(isBasic)return addFeeToRange(Math.max(5,q*1),Math.max(10,q*2));
    return addFeeToRange(Math.max(10,Math.round(q*2)),Math.max(15,Math.round(q*3.5)));
  }

  if(hasAny(details,['flyer','poster','thumbnail','banner','social graphic','graphic','logo','simple edit','photo edit'])&&!hasSystem&&!isPrinted){
    if(isPremium)return addFeeToRange(35,75);
    if(q>=5)return addFeeToRange(20,50);
    return addFeeToRange(10,25);
  }

  if(details.includes('ai video')&&!hasAny(details,['website','chatbot','automation','stripe','membership'])){
    if(hasAny(details,['edit','editing','script','marketing','caption']))return addFeeToRange(q*15,q*35);
    return addFeeToRange(q*5,q*10);
  }

  if(details.includes('website')&&hasAny(details,['chatbot','membership','payment','stripe','custom order','automation']))return addFeeToRange(300,600,'bundle estimate');
  if(details.includes('website'))return hasAny(details,['business','professional'])?addFeeToRange(150,275):addFeeToRange(100,175);
  if(hasAny(details,['automation','workflow','auto reply','social media automation']))return hasAny(details,['multi-step','custom','posting','content'])?addFeeToRange(175,300):addFeeToRange(70,125);

  if(selectedPackages.length){
    const total=selectedPackages.reduce((sum,p)=>sum+(Number(p.amount)||0),0);
    if(total>0)return `$${total} estimate`;
  }
  return addFeeToRange(10,50);
}
function localReason(price){
  const d=detailsText();const q=quantity();
  if(hasAny(d,['graduation card','grad card','cards','card','invitation','invite'])){
    if(hasAny(d,['basic','simple','template']))return `${q} basic card${q===1?'':'s'} are treated like a simple template/name/photo swap, not website pricing.`;
    if(hasAny(d,['premium','cinematic','animated','heavy','advanced']))return `${q} premium card${q===1?'':'s'} include heavier design work, so they cost more than basic cards.`;
    return `${q} custom card${q===1?'':'s'} are priced as personalized graphic work, not a website or full package.`;
  }
  if(hasAny(d,['flyer','poster','thumbnail','banner','logo','graphic']))return 'This is graphic design work, so it uses affordable design pricing.';
  if(d.includes('website'))return 'This is website work, so it uses website pricing instead of graphic pricing.';
  if(d.includes('automation'))return 'This is automation work, so it uses automation pricing.';
  if(d.includes('ai video'))return 'This is AI video work, so it uses per-video pricing.';
  return 'This Easy Yes estimate is based on the request, quantity, speed, and selected options.';
}
function budgetNote(price){
  const total=priceNumber(price);const info=getBudgetInfo();
  if(info.max!==999999&&total>info.max)return ` This is over the selected ${info.label} budget, so a smaller starter version may be needed.`;
  if(total>=info.min&&total<=info.max)return ` This fits the selected ${info.label} budget.`;
  if(total<info.min)return ` This is below your selected ${info.label} budget, so you could keep it simple or add upgrades.`;
  return ' Final quote may change after review.';
}
function addApprovalButton(){
  let btn=document.getElementById('approveQuoteBtn');
  if(!btn){btn=document.createElement('a');btn.id='approveQuoteBtn';btn.className='glow-btn';btn.style.marginTop='18px';btn.style.display='inline-block';btn.target='_blank';document.querySelector('.estimate-box')?.appendChild(btn)}
  btn.href=customDepositLink;btn.innerText='Start review with $5 deposit';
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
    if(!details.trim()&&!selectedPackages.length){
      if(estimateText)estimateText.innerText='Type your request or pick a prebuilt service. Real AI will create an Easy Yes price.';
      if(aiReason)aiReason.innerText='The quote uses custom request, packages, quantity, frequency, speed, and budget.';
      return;
    }
    const protectedPrice=localQuote();
    let finalPrice=protectedPrice;
    let reason=localReason(finalPrice);
    if(estimateText)estimateText.innerText=`Estimated Easy Yes price: ${finalPrice}`;
    if(aiReason)aiReason.innerText=reason+' '+budgetNote(finalPrice)+' Final quote can change after manual review. The $5 deposit only starts review, it is not the full project payment.';
    if(estimateInput)estimateInput.value=finalPrice;
    addApprovalButton();
    try{
      const res=await fetch('/quote-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selected:selectedPackages,quantity:quantity(),frequency:frequency(),timeline:document.getElementById('timeline')?.value||'no-rush',budget:document.getElementById('budget')?.value||'starter',details,deliveryFee:deliveryFee(),customer:getProfile(),memberStatus:detectMemberStatus()})});
      const data=await res.json();
      if(data.price){
        finalPrice=data.price;
        reason=data.reason||reason;
        if(estimateText)estimateText.innerText=`Estimated Easy Yes price: ${finalPrice}`;
        if(aiReason)aiReason.innerText=reason+' '+budgetNote(finalPrice)+' Final quote can change after manual review. The $5 deposit only starts review, it is not the full project payment.';
        if(estimateInput)estimateInput.value=finalPrice;
      }
    }catch(e){}
    lastEstimate=finalPrice;
  },350);
}
document.querySelectorAll('input,textarea,select').forEach(el=>{el.addEventListener('change',updateEstimate);el.addEventListener('input',updateEstimate);el.addEventListener('input',saveForm)});
if(form){form.addEventListener('submit',async e=>{e.preventDefault();syncPackages();saveForm();await updateEstimate();setTimeout(async()=>{const data=new FormData(form);data.append('member_status',detectMemberStatus());if(estimateInput&&!estimateInput.value)estimateInput.value=lastEstimate||localQuote();try{await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()});if(success){success.style.display='block';success.innerText='Order submitted. The $5 deposit starts review, and the final quote may change after manual review.'}}catch(err){if(success){success.style.display='block';success.innerText='Order saved on this page. Try submitting again or email the details.'}}},450)})}
applySaved();updateEstimate();
