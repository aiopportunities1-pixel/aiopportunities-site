document.addEventListener('DOMContentLoaded',function(){
  var form=document.getElementById('orderForm');
  if(!form||document.getElementById('tierToolsBox')) return;
  var box=document.createElement('div');
  box.id='tierToolsBox';
  box.className='admin-panel-lite';
  box.innerHTML='<h3>Owner Tier Tools</h3><p>Use this to update the tier shown on this device and order emails.</p><input type="password" id="tierToolKey" placeholder="Owner key"><button type="button" id="tierToolOpen" class="glow-btn secondary-action">Unlock</button><div id="tierToolControls" style="display:none;margin-top:16px;gap:12px;grid-template-columns:1fr auto;align-items:center;"><select id="tierToolValue"><option>Guest / Not verified</option><option>Supporter Member</option><option>Supporter+ Member</option><option>Master Member</option><option>Owner / Admin</option></select><button type="button" id="tierToolSave" class="glow-btn">Save</button></div>';
  var estimate=document.querySelector('.estimate-box');
  form.insertBefore(box,estimate||form.firstChild);
  var key=document.getElementById('tierToolKey');
  var open=document.getElementById('tierToolOpen');
  var controls=document.getElementById('tierToolControls');
  var value=document.getElementById('tierToolValue');
  var save=document.getElementById('tierToolSave');
  function showTier(t){
    localStorage.setItem('aiopp_member_status',t);
    var p={};
    try{p=JSON.parse(localStorage.getItem('aiopp_profile')||'{}')}catch(e){}
    p.memberStatus=t;
    localStorage.setItem('aiopp_profile',JSON.stringify(p));
    document.querySelectorAll('#memberBadge,#memberTierText').forEach(function(el){if(el)el.innerText=t});
  }
  if(localStorage.getItem('aiopp_tier_tools')==='open') controls.style.display='grid';
  open.onclick=async function(){
    var res=await fetch('/member-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminKey:key.value})});
    var data=await res.json();
    if(data.ok){localStorage.setItem('aiopp_tier_tools','open');controls.style.display='grid';key.value=''}else{alert('Wrong key')}
  };
  save.onclick=function(){showTier(value.value);alert('Tier saved')};
});
