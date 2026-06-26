/* AI Opportunities membership upgrade - injected by ChatGPT */
(function(){
  const LINKS={
    'Supporter':'https://buy.stripe.com/3cIbJ0fYJazjean4oB8Zq0x',
    'Supporter+':'https://buy.stripe.com/9B69AS8whbDngivcV78Zq0w',
    'Master':'https://buy.stripe.com/3cIfZgh2N0YJ1nBaMZ8Zq0v'
  };
  const MASTER_LINK=LINKS.Master;
  function money(n){return '$'+Number(n||0).toFixed(2)}
  function injectStyles(){
    if(document.getElementById('membershipUpgradeStyles'))return;
    const css=document.createElement('style');
    css.id='membershipUpgradeStyles';
    css.textContent=`
      .upgraded-memberships{max-width:1320px;margin:auto;padding:80px 5%;}
      .membership-topper{display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:stretch;margin-bottom:32px;}
      .master-side-callout,.member-benefits,.savings-calculator,.comparison-wrap,.why-master,.master-benefits-panel{background:linear-gradient(145deg,rgba(7,22,47,.96),rgba(4,41,27,.9));border:1px solid rgba(69,255,147,.28);border-radius:28px;box-shadow:0 18px 55px rgba(0,0,0,.28),0 0 28px rgba(69,255,147,.12);padding:28px;}
      .master-side-callout,.master-benefits-panel{position:relative;overflow:hidden;border:2px solid rgba(69,255,147,.45);}
      .master-side-callout:before,.master-benefits-panel:before{content:"";position:absolute;inset:-2px;background:linear-gradient(120deg,transparent,rgba(69,255,147,.14),transparent);transform:translateX(-100%);animation:masterSheen 4s infinite;pointer-events:none;}
      @keyframes masterSheen{60%,100%{transform:translateX(100%)}}
      .master-side-callout h3,.master-benefits-panel h3,.member-benefits h3,.why-master h3{font-size:clamp(1.55rem,3vw,2.35rem);margin:0 0 10px;color:#fff;}
      .master-side-callout strong,.master-benefits-panel strong,.savings-stat strong{display:block;color:#45ff93;font-size:clamp(2rem,5vw,4rem);line-height:1;margin:14px 0;text-shadow:0 0 24px rgba(69,255,147,.3);}
      .master-side-callout p,.master-benefits-panel p,.member-benefits p,.why-master p{color:#c8d8ea;line-height:1.7;}
      .master-benefit-list{display:grid;gap:10px;margin:18px 0 22px;}
      .master-benefit-list div{display:flex;gap:10px;align-items:center;background:rgba(2,6,23,.48);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:13px 14px;color:#e8f7ff;font-weight:850;}
      .master-benefit-list b{color:#45ff93;}
      .service-chip-row{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0;}
      .service-chip-row span,.plan-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(69,255,147,.28);background:rgba(69,255,147,.09);color:#eafff3;border-radius:999px;padding:9px 12px;font-weight:800;font-size:.9rem;}
      .upgraded-grid{grid-template-columns:repeat(3,minmax(260px,1fr));align-items:stretch;}
      .membership-card.accessible-card{position:relative;text-align:left;padding:34px;display:flex;flex-direction:column;gap:12px;min-height:510px;}
      .membership-card.accessible-card h3{font-size:1.55rem;margin:8px 0;color:#fff;}
      .membership-card.accessible-card h1{font-size:clamp(3rem,6vw,4.3rem);margin:4px 0;color:#45ff93;line-height:.95;}
      .membership-card.accessible-card h1 span{font-size:1rem;color:#cbd5e1;}
      .membership-card.accessible-card ul{margin:8px 0 18px;padding-left:20px;color:#d7e6f5;line-height:1.8;}
      .membership-card.accessible-card a{margin-top:auto;width:100%;}
      .master-featured{transform:scale(1.03);border:2px solid #45ff93!important;box-shadow:0 0 45px rgba(69,255,147,.32),0 22px 70px rgba(0,0,0,.38)!important;}
      .popular-ribbon{position:absolute;right:20px;top:18px;background:linear-gradient(135deg,#45ff93,#38d5ff);color:#02131f;border-radius:999px;padding:9px 13px;font-weight:1000;font-size:.78rem;box-shadow:0 0 20px rgba(69,255,147,.35);}
      .discount-badge{background:rgba(69,255,147,.14);border:1px solid rgba(69,255,147,.4);color:#45ff93;border-radius:16px;padding:12px 14px;font-weight:900;}
      .member-benefits{margin:32px 0;}
      .benefit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-top:18px;}
      .benefit-grid div{background:rgba(2,6,23,.45);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px;color:#e8f7ff;font-weight:800;}
      .master-promo-grid{display:grid;grid-template-columns:1fr .75fr;gap:24px;margin:32px 0;align-items:stretch;}
      .savings-stat{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:radial-gradient(circle at top,rgba(69,255,147,.18),rgba(7,22,47,.9));border:1px solid rgba(69,255,147,.32);border-radius:28px;padding:28px;}
      .savings-stat span{color:#cbd5e1;font-weight:900;}
      .savings-calculator{margin:28px 0;}
      .calculator-card{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:end;margin-top:18px;}
      .calculator-card label{font-weight:900;color:#45ff93;}
      .calculator-card input{width:100%;margin-top:8px;padding:16px;border-radius:16px;border:1px solid rgba(69,255,147,.3);background:rgba(2,6,23,.72);color:#fff;font-size:1.05rem;}
      .calc-row{background:rgba(2,6,23,.52);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px;}
      .calc-row span{display:block;color:#a8bfd5;font-weight:800;margin-bottom:8px;}
      .calc-row b{font-size:1.4rem;color:#45ff93;}
      .comparison-wrap{overflow:auto;margin:30px 0;}
      .comparison-table{min-width:720px;display:grid;gap:8px;}
      .comparison-row{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:8px;align-items:center;}
      .comparison-row div{background:rgba(2,6,23,.48);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;text-align:center;color:#dbeafe;font-weight:800;}
      .comparison-row div:first-child{text-align:left;color:#fff;}
      .comparison-row.header div{background:rgba(69,255,147,.14);color:#45ff93;}
      .why-master{text-align:center;margin-top:30px;}
      .price-example{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:18px 0;}
      .price-example div{min-width:190px;background:rgba(2,6,23,.55);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:18px;}
      .price-example span{display:block;color:#a8bfd5;font-weight:800;margin-bottom:7px;}
      .price-example b{font-size:2rem;color:#45ff93;}
      @media(max-width:900px){.membership-topper,.master-promo-grid,.calculator-card{grid-template-columns:1fr}.upgraded-grid{grid-template-columns:1fr}.master-featured{transform:none}.membership-card.accessible-card{min-height:auto}}
    `;
    document.head.appendChild(css);
  }
  function planCard(name,price,items,extraClass,badge){
    const link=LINKS[name]||MASTER_LINK;
    return `<div class="membership-card accessible-card ${extraClass||''}">${badge||''}<h3>${name}</h3><h1>$${price}<span>/month</span></h1><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul><a href="${link}" target="_blank" aria-label="Join ${name} membership">${name==='Master'?'Become a Master Member':'Join '+name}</a></div>`;
  }
  function renderMemberships(){
    const section=document.getElementById('memberships');
    if(!section)return;
    section.classList.add('upgraded-memberships');
    section.innerHTML=`
      <div class="membership-topper">
        <div class="section-head"><span class="kicker">MEMBERSHIP PLANS</span><h2>Choose the level that fits your grind.</h2><p>Monthly plans with real perks, better access, business resources, and savings on AI Opportunities services.</p></div>
        <div class="master-benefits-panel"><h3>💎 Why Choose Master?</h3><strong>15% OFF</strong><p>Master is for people who want the best access, fastest help, and real savings every time they order.</p><div class="master-benefit-list"><div>💸 <b>15% OFF</b> every AI Opportunities order</div><div>⚡ Priority support and fastest response time</div><div>📈 Business strategy breakdowns</div><div>🤝 Direct project guidance</div><div>🎖️ VIP Discord role</div><div>✅ Everything included in Supporter+</div></div><a href="${MASTER_LINK}" target="_blank" class="glow-btn">Become a Master Member →</a></div>
      </div>
      <div class="membership-grid upgraded-grid">
        ${planCard('Supporter',20,['Discord Community Access','Weekly AI Money Methods','Exclusive AI Tips','Basic Service Discounts','Members-Only Announcements'],'','<span class="plan-badge">Starter Access</span>')}
        ${planCard('Supporter+',25,['Everything in Supporter','Live Money Meetings','Prompt & Template Library','Monthly Growth Checklist','AI Business Resources','Early Access to New Tools'],'','<span class="plan-badge">More Resources</span>')}
        ${planCard('Master',35,['Everything in Supporter+','Priority Help','Business Strategy Breakdowns','Direct Project Guidance','15% OFF Every AI Opportunities Order','Fastest Response Time','VIP Discord Role'],'featured master-featured','<span class="popular-ribbon">🔥 MOST POPULAR</span><span class="discount-badge">⭐ Includes 15% OFF every order</span>')}
      </div>
      <div class="member-benefits"><h3>Members Receive</h3><p>Everything feels more exclusive and useful, not just a basic subscription.</p><div class="benefit-grid"><div>🔒 Exclusive AI Prompt Vault</div><div>🎥 Private Tutorial Library</div><div>💰 Weekly Money-Making Methods</div><div>🤖 AI Tool Releases</div><div>📈 Business Growth Resources</div><div>💬 Private Discord Community</div></div></div>
      <div class="master-promo-grid"><div class="master-side-callout"><h3>Become a Master Member</h3><p>Save 15% on every AI Opportunities service.</p><div class="service-chip-row"><span>✔ Websites</span><span>✔ AI Videos</span><span>✔ AI Chatbots</span><span>✔ AI Automations</span><span>✔ Social Media</span><span>✔ Photo & Video Editing</span><span>✔ Every Digital Service</span></div><a href="${MASTER_LINK}" target="_blank" class="glow-btn">Become a Master Member →</a></div><div class="savings-stat"><strong id="savingsCounter">$0+</strong><span>Saved by Master Members</span></div></div>
      <div class="savings-calculator"><div class="section-head"><span class="kicker">SAVINGS CALCULATOR</span><h2>See What Master Saves You</h2><p>Type your order amount and instantly see your 15% Master discount.</p></div><div class="calculator-card"><label>Order Total<input id="masterOrderAmount" type="number" min="0" step="1" value="300"></label><div class="calc-row"><span>Master Discount (15%)</span><b id="discountAmount">-$45.00</b></div><div class="calc-row"><span>You Pay</span><b id="finalAmount">$255.00</b></div></div><p id="calcHelp" class="small-note">Example: a $300 website becomes $255 with Master.</p></div>
      <div class="comparison-wrap"><div class="section-head"><span class="kicker">COMPARE PLANS</span><h2>Membership Breakdown</h2></div><div class="comparison-table" role="table"><div class="comparison-row header"><div>Feature</div><div>Supporter</div><div>Supporter+</div><div>Master</div></div>${[['Discord Access','✅','✅','✅'],['Weekly AI Methods','✅','✅','✅'],['AI Tips','✅','✅','✅'],['Templates','—','✅','✅'],['Live Meetings','—','✅','✅'],['Growth Checklist','—','✅','✅'],['Priority Help','—','—','✅'],['Strategy Breakdowns','—','—','✅'],['Direct Project Guidance','—','—','✅'],['15% Off Every Order','—','—','✅']].map(r=>`<div class="comparison-row"><div>${r[0]}</div><div>${r[1]}</div><div>${r[2]}</div><div>${r[3]}</div></div>`).join('')}</div></div>
      <div class="why-master"><h3>Why Go Master?</h3><p>Buying one $300 website? Master already saves you real money.</p><div class="price-example"><div><span>Regular Price</span><b>$300</b></div><div><span>Master Member</span><b>$255</b></div><div><span>You Save</span><b>$45</b></div></div><p>Order multiple services through the year and the membership can pay for itself fast.</p><a href="${MASTER_LINK}" target="_blank" class="glow-btn">Join Master Today</a></div>
    `;
  }
  function setupSavings(){
    const input=document.getElementById('masterOrderAmount'), discount=document.getElementById('discountAmount'), final=document.getElementById('finalAmount');
    function calc(){const amount=Math.max(0,Number(input?.value||0));const save=amount*.15;if(discount)discount.textContent='-'+money(save);if(final)final.textContent=money(amount-save)}
    if(input){input.addEventListener('input',calc);calc()}
    const counter=document.getElementById('savingsCounter');
    if(counter){let started=false;const run=()=>{if(started)return;started=true;let n=0,target=5000,step=125;const t=setInterval(()=>{n+=step;if(n>=target){n=target;clearInterval(t)}counter.textContent='$'+n.toLocaleString()+'+'},22)};if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){run();obs.disconnect()}})},{threshold:.35});obs.observe(counter)}else run()}
  }
  function init(){injectStyles();renderMemberships();setupSavings()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
