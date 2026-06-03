document.addEventListener('DOMContentLoaded',()=>{
  const chatbot=document.getElementById('chatbot');
  const messages=document.getElementById('chatMessages');
  const input=document.getElementById('chatInput');
  const send=document.getElementById('sendBtn');
  const toggle=document.getElementById('chatToggle');
  const openChat=document.getElementById('openChat');
  const closeChat=document.getElementById('closeChat');
  const quick=[...document.querySelectorAll('.chat-quick-buttons button')];
  let history=[];
  if(!chatbot||!messages||!input||!send)return;
  function open(){chatbot.style.display='flex'}
  function close(){chatbot.style.display='none'}
  function add(text,cls){const div=document.createElement('div');div.className=cls;div.innerText=text;messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div}
  function context(){return{selected:[...document.querySelectorAll('.package-card.selected')].map(x=>x.dataset.service),details:document.getElementById('details')?.value||'',quantity:document.getElementById('quantity')?.value||'',timeline:document.getElementById('timeline')?.value||'',budget:document.getElementById('budget')?.value||''}}
  function fallback(text){const t=String(text||'').toLowerCase();if(t.includes('price')||t.includes('cost'))return 'For pricing, I’d scope it first so you don’t overpay or underpay. AI videos and small edits can start low, starter websites are usually $75–$175+, and automation/website bundles can be $100–$600+ depending on what you need. The $5 deposit starts review only.';if(t.includes('website'))return 'For a website, I’d recommend a clean one-page build first: hero, services, portfolio, testimonials, contact/book button, and SEO basics. Add chatbot, payments, or custom order panels if you want it to feel more advanced.';if(t.includes('automation'))return 'Automation is best when it saves you from doing the same task over and over. Good setups include lead capture, follow-ups, form-to-email flows, content planning, and customer reminders.';if(t.includes('content')||t.includes('video'))return 'For content, I’d start with hooks, captions, short AI videos, and a posting plan. The goal is simple: make the business look active, trustworthy, and easy to buy from.';return 'I can help with websites, AI automations, AI videos, content, branding, pricing, and custom digital ideas. Tell me what business this is for, what you want built, your deadline, and your budget vibe.'}
  async function ask(text){try{const res=await fetch('/chat-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,orderContext:context(),history:history.slice(-8)})});if(!res.ok)throw new Error('bad');const data=await res.json();return data.reply||fallback(text)}catch(e){return fallback(text)}}
  async function sendMsg(raw){const val=(raw||input.value||'').trim();if(!val)return;open();add(val,'user-message');history.push({role:'user',content:val});input.value='';const thinking=add('Thinking...','bot-message');const reply=await ask(val);thinking.innerText=reply;history.push({role:'assistant',content:reply})}
  toggle&&toggle.addEventListener('click',open);
  openChat&&openChat.addEventListener('click',open);
  closeChat&&closeChat.addEventListener('click',close);
  send.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();sendMsg()},true);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();sendMsg()}},true);
  quick.forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();sendMsg(btn.innerText)},true));
});
