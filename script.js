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

async function askRealAI(text){
  try{
    const res=await fetch('/chat-ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        message:text,
        orderContext:{
          quantity:document.getElementById('quantity')?.value||1,
          frequency:document.getElementById('frequency')?.value||'one-time',
          timeline:document.getElementById('timeline')?.value||'no-rush',
          budget:document.getElementById('budget')?.value||'starter',
          details:document.getElementById('details')?.value||''
        }
      })
    });
    const data=await res.json();
    return data.reply||'Something went wrong. Try again.';
  }catch(e){
    return 'The AI assistant is reconnecting right now. Try again in a second.';
  }
}

async function handleChatMessage(text){
  userReply(text);
  botReply('Thinking...');
  const thinking=document.querySelector('.bot-message:last-child');
  const reply=await askRealAI(text);
  if(thinking)thinking.innerText=reply;
}

if(send){
  send.onclick=async()=>{
    const val=input.value.trim();
    if(!val)return;
    input.value='';
    await handleChatMessage(val);
  }
}

if(input){
  input.addEventListener('keydown',async e=>{
    if(e.key==='Enter'&&send){
      e.preventDefault();
      send.click();
    }
  })
}

document.querySelectorAll('.chat-quick-buttons button').forEach(btn=>{
  btn.onclick=async()=>{
    await handleChatMessage(btn.innerText);
  }
});

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
function priceNumber(price){const matches=String(price||'').match(/\d+/g);return matches?Number(matches[0]):0}
function detailsText(){return String(document.getElementById('details')?.value||'').toLowerCase()}
function quantity(){return Math.max(1,Math.min(300,Number(document.getElementById('quantity')?.value||1)))}
function frequency(){return document.getElementById('frequency')?.value||'one-time'}
function localQuote(){
  const q=quantity();
  const details=detailsText();

  if(details.includes('graduation card')||details.includes('grad card')){
    if(details.includes('basic'))return '$10-$20 estimate';
    if(details.includes('premium')||details.includes('cinematic')||details.includes('animated'))return '$40-$60 estimate';
    return '$20-$35 estimate';
  }

  if(details.includes('flyer')||details.includes('poster')||details.includes('thumbnail')||details.includes('banner')){
    return q>=5?'$25-$50 estimate':'$10-$25 estimate';
  }

  if(details.includes('ai video')&&!details.includes('edit')){
    return `$${Math.max(5,q*5)}-$${Math.max(10,q*10)} estimate`;
  }

  if(details.includes('website')&&(details.includes('chatbot')||details.includes('membership')||details.includes('payment')||details.includes('custom order'))){
    return '$300-$600 bundle estimate';
  }

  if(details.includes('website'))return '$100-$275 estimate';
  if(details.includes('automation'))return '$70-$300 estimate';

  return '$25-$75 estimate';
}
