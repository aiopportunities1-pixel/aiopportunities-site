(function(){
  function q(id){return document.getElementById(id)}
  function addStyles(){
    var s=document.createElement('style');
    s.textContent='.ai-rewards-tab{position:fixed;right:0;top:38%;z-index:1400;background:linear-gradient(135deg,#45ff93,#38d5ff);color:#02131f;border:0;border-radius:18px 0 0 18px;padding:15px 10px;font-weight:900;writing-mode:vertical-rl;cursor:pointer}.ai-rewards-box{position:fixed;right:0;top:25%;z-index:1399;width:340px;max-width:90vw;background:rgba(6,21,40,.97);border:1px solid rgba(69,255,147,.4);border-radius:24px 0 0 24px;padding:20px;box-shadow:0 0 45px rgba(69,255,147,.22);transform:translateX(100%);transition:.25s}.ai-rewards-box.open{transform:translateX(0)}.ai-rewards-box h3{margin:0 0 10px;color:#fff}.ai-rewards-box p{color:#c8d8ea}.ai-rewards-box input{width:100%;padding:13px;border-radius:14px;border:1px solid rgba(69,255,147,.25);background:#020617;color:#fff;margin:8px 0}.ai-points{font-size:2.4rem;color:#45ff93;font-weight:900}.ai-reward-item{background:rgba(255,255,255,.06);border-radius:14px;padding:10px;margin:8px 0;color:#fff}.member-hub-section{max-width:1320px;margin:auto;padding:78px 5%}.member-hub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}.member-hub-card{background:linear-gradient(145deg,rgba(7,22,47,.96),rgba(4,41,27,.9));border:1px solid rgba(69,255,147,.28);border-radius:26px;padding:26px;color:#fff}.member-hub-card p,.member-hub-card li{color:#c8d8ea;line-height:1.6}.locked-preview{filter:blur(1px);opacity:.75}';
    document.head.appendChild(s);
  }
  async function lookup(email){
    try{var r=await fetch('/member-lookup?email='+encodeURIComponent(email));return await r.json()}catch(e){return {tier:'Guest / Not verified',points:0,active:false}}
  }
  function addRewards(){
    if(q('aiRewardsTab'))return;
    var tab=document.createElement('button');tab.id='aiRewardsTab';tab.className='ai-rewards-tab';tab.textContent='AI Rewards';
    var box=document.createElement('div');box.id='aiRewardsBox';box.className='ai-rewards-box';
    box.innerHTML='<h3>🏆 Member Rewards</h3><p>Check your membership and AI Points.</p><input id="aiRewardEmail" type="email" placeholder="Membership email"><button id="aiRewardCheck" class="glow-btn">Check Status</button><div id="aiRewardPoints" class="ai-points">0 pts</div><p id="aiRewardTier">Guest / Not verified</p><div class="ai-reward-item">500 pts = Free AI video</div><div class="ai-reward-item">1,000 pts = Free website update</div><div class="ai-reward-item">2,500 pts = Free custom service</div>';
    document.body.appendChild(tab);document.body.appendChild(box);
    tab.onclick=function(){box.classList.toggle('open')};
    q('aiRewardCheck').onclick=async function(){var d=await lookup(q('aiRewardEmail').value);q('aiRewardPoints').textContent=Number(d.points||0).toLocaleString()+' pts';q('aiRewardTier').textContent=(d.active?d.tier:'Guest / Not verified')+(d.lifetimeSpend?' • $'+Number(d.lifetimeSpend).toFixed(2)+' spent':'')};
  }
  function addHub(){
    if(q('memberHub'))return;
    var sec=document.createElement('section');sec.id='memberHub';sec.className='member-hub-section';
    sec.innerHTML='<div class="section-head"><span class="kicker">MEMBER DASHBOARD</span><h2>Member Hub Preview</h2><p>Check membership, rewards, downloads, resources, and VIP perks.</p></div><div class="member-hub-grid"><div class="member-hub-card"><h3>💎 Membership Status</h3><p>Use the AI Rewards tab to check your current tier and points.</p><ul><li>Master = 15% off orders</li><li>Supporter+ = templates and meetings</li><li>Supporter = community access</li></ul></div><div class="member-hub-card"><h3>🏆 AI Points</h3><p>Points are built to track from purchases connected to your membership email.</p><div class="ai-reward-item">Spend $100 = 100 points</div><div class="ai-reward-item">500 points = free AI video</div></div><div class="member-hub-card locked-preview"><h3>🔒 Prompt Vault</h3><p>Business prompts, ad scripts, AI video prompts, and automation templates.</p></div><div class="member-hub-card locked-preview"><h3>🎥 Tutorial Library</h3><p>Exclusive tutorials, business resources, and growth methods.</p></div></div>';
    var m=document.getElementById('memberships');m?m.insertAdjacentElement('afterend',sec):document.body.appendChild(sec);
  }
  function init(){addStyles();addRewards();addHub()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
