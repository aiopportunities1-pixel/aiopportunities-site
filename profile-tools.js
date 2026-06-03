document.addEventListener('DOMContentLoaded',function(){
var buddyCss=document.createElement('link');buddyCss.rel='stylesheet';buddyCss.href='buddy-only.css';document.head.appendChild(buddyCss);
var chat=document.getElementById('chatbot'),msgs=document.getElementById('chatMessages'),inp=document.getElementById('chatInput'),send=document.getElementById('sendBtn');
var toggle=document.getElementById('chatToggle'),openBtn=document.getElementById('openChat'),closeBtn=document.getElementById('closeChat');
var history=[];
function open(){if(chat)chat.style.display='flex'}
function close(){if(chat)chat.style.display='none'}
function add(t,c){if(!msgs)return null;var d=document.createElement('div');d.className=c;d.innerText=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
function ctx(){return{details:document.getElementById('details')?.value||'',budget:document.getElementById('budget')?.value||'',timeline:document.getElementById('timeline')?.value||'',selected:[...document.querySelectorAll('.package-card.selected')].map(x=>x.dataset.service)}}
function backup(t){t=String(t||'').toLowerCase();if(t.includes('price')||t.includes('cost'))return 'I can help price it smart. Small edits and AI videos can start low, starter websites are usually $75–$175+, and bigger website/automation bundles can be $100–$600+ depending on scope. The $5 deposit starts review only.';if(t.includes('website'))return 'For a website, I would start with a clean one-page build: hero, services, portfolio, testimonials, contact/book button, and SEO basics. Add chatbot, payments, or custom orders if you want it more advanced.';if(t.includes('automation'))return 'Automation works best when it saves repeated work: leads, follow-ups, reminders, forms, order details, and content workflows. Tell me what task you repeat the most.';return 'I can help with websites, automations, AI videos, content, branding, pricing, and custom digital builds. Tell me your business, goal, deadline, and budget vibe.'}
async function ask(t){try{var r=await fetch('/chat-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t,orderContext:ctx(),history:history.slice(-8)})});if(!r.ok)throw 0;var j=await r.json();return j.reply||backup(t)}catch(e){return backup(t)}}
async function go(raw){var v=(raw||inp?.value||'').trim();if(!v)return;open();add(v,'user-message');history.push({role:'user',content:v});if(inp)inp.value='';var wait=add('Thinking...','bot-message');var reply=await ask(v);if(wait)wait.innerText=reply;history.push({role:'assistant',content:reply})}
if(toggle)toggle.onclick=open;if(openBtn)openBtn.onclick=open;if(closeBtn)closeBtn.onclick=close;if(send)send.onclick=function(e){e.preventDefault();go()};if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go()}});
document.querySelectorAll('.chat-quick-buttons button').forEach(function(b){b.onclick=function(e){e.preventDefault();go(b.innerText)}});
});
