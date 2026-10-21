import {SEED} from './seed.js';import * as L from './logic.js';
const KEY='motovault_ai_v2';let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch{}S=S||structuredClone(SEED);
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Number(v).toLocaleString('en-MY'),rm=v=>'RM'+Number(v).toLocaleString('en-MY',{minimumFractionDigits:v%1?2:0,maximumFractionDigits:2});
const fd=d=>new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
let tab='home';const TABS=[['home','Home'],['history','History'],['add','+'],['parts','Parts'],['more','More']];
function tabs(){$('#tabs').innerHTML=TABS.map(([k,l])=>`<button data-t="${k}" class="${k==='add'?'fab':tab===k?'on':''}" aria-label="${k==='add'?'Log service':l}">${l}</button>`).join('')}
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;t==='add'?svcSheet():(tab=t,render())};
function sheet(html){const s=$('#sheet');s.innerHTML=`<div>${html}</div>`;s.hidden=false;s.onclick=e=>{if(e.target===s)close()}}
const close=()=>{$('#sheet').hidden=true};
function home(){const ns=L.nextService(S),v=S.vehicle,od=S.odo,age=Math.round((Date.now()-Date.parse(od.date))/864e5);
  if(!ns)return `<h1>${esc(v.model)}</h1><p class="mut">Log a service with an engine oil change to see the next service.</p>`;
  const pct=Math.max(0,Math.min(100,100*(od.km-ns.last.km)/v.serviceIntervalKm)),up=L.partsStatus(S).filter(p=>p.left!==null).sort((a,b)=>a.left-b.left).slice(0,3);
  const eta=ns.remaining<=0?'<b>Due now</b>':ns.eta?`Expected <b>${fd(ns.eta[0])}${ns.eta[0]!==ns.eta[1]?' to '+fd(ns.eta[1]):''}</b>`:'Not enough valid history to estimate a date';
  return `<div class="row"><div><h1>${esc(v.brand)} ${esc(v.model)}</h1><div class="sub">Next service</div></div></div>
  <div class="card" style="margin-top:14px"><div class="big">${ns.remaining>0?n(ns.remaining):'0'}<small> km to go</small></div><div class="eta mut" style="margin-top:8px">${eta}</div>
  <div class="rule"><i></i><u style="left:${pct}%"></u><s></s><span style="left:0">${n(ns.last.km)}</span><span style="right:0">${n(ns.dueKm)} service</span></div>
  <div class="warn row"><span>${od.confirmed?'Odometer':'Last known odometer'} ${n(od.km)} km on ${fd(od.date)}${age>14?` (${age} days ago)`:''}</span><button class="link" id="odo">Update</button></div>
  ${ns.remaining<=v.warnKm&&ns.remaining>0?`<div class="warn">Service due within ${v.warnKm} km.</div>`:''}</div>
  <h2>Up next</h2>${up.map(p=>`<div class="part"><b>${esc(p.name)}</b><div class="mut">due at ${n(p.dueKm)} km · ${p.left>0?n(p.left)+' km left':'overdue'}</div></div>`).join('')}
  <h2>Last service</h2>${svcRow(L.byDate(S.services).pop(),true)}`}
function svcRow(s,card){const f=L.flagged(S.services).has(s.id);
  return `<div class="${card?'card':''} hr" data-id="${esc(s.id)}" ${card?'style="border-top:1px solid var(--b)"':''}><div class="d">${fd(s.date)}</div><div class="x"><div class="row"><b>${esc(s.type)}</b><b>${rm(s.cost)}</b></div>
  <div class="mut">${f?'<span class="fl">⚠ ':'<span>'}${n(s.km)} km</span> · ${esc(s.parts.join(', ')||'No parts')}${s.workshop?' · '+esc(s.workshop):''}</div></div></div>`}
function history(){const all=L.byDate(S.services).reverse();
  return `<h1>History</h1><div class="sum"><div><b>${all.length}</b><span class="mut">services</span></div><div><b>${rm(L.total(S.services))}</b><span class="mut">spent</span></div></div>
  <input id="q" placeholder="Search parts, workshop, notes" aria-label="Search"><div id="list">${all.map(s=>svcRow(s)).join('')}</div>
  <p class="mut fl" style="margin-top:10px">⚠ Odometer needs review. Kept as recorded and left out of forecasts.</p>`}
function parts(){const ps=L.partsStatus(S),has=ps.filter(p=>p.last),no=ps.filter(p=>!p.last);
  return `<h1>Parts</h1><div class="sub">Yamaha XMAX 250 · intervals are your own settings</div><h2>Tracked</h2>
  ${has.map(p=>{const bad=L.flagged(S.services).has(p.last.id),w=p.left===null?0:Math.max(0,Math.min(100,100*p.left/p.interval));
  return `<div class="part"><div class="row"><b>${esc(p.name)}</b><b>${p.dueKm?n(p.dueKm)+' km':'Set interval'}</b></div><div class="row mut"><span>changed ${fd(p.last.date)} at ${n(p.last.km)} km${bad?' ⚠':''}</span><span>${p.left===null?'':p.left>0?n(p.left)+' km left':'overdue'}</span></div>
  <div class="bar ${bad||w<25?'a':''}"><i style="width:${w}%"></i></div></div>`}).join('')}
  <h2>No change on record. Tap to log its last change.</h2><div class="chips">${no.map(p=>`<button class="chip dash" data-p="${esc(p.name)}">${esc(p.name)}</button>`).join('')}</div>`}
function more(){const sv=L.total(S.services),fu=L.total(S.fuel),ex=L.total(S.expenses),t=sv+fu+ex;
  const list=(a,f)=>a.length?`<div>${L.byDate(a).reverse().map(f).join('')}</div>`:'';
  return `<h1>More</h1><h2>Spending so far</h2><div class="stack"><i style="width:${100*sv/t}%;background:#8FC9B5"></i><i style="width:${100*ex/t}%;background:#4E8F7A"></i><i style="width:${100*fu/t}%;background:#D8A657"></i></div>
  <div class="row"><span>Services</span><b>${rm(sv)}</b></div><div class="row"><span>Other expenses</span><b>${rm(ex)}</b></div><div class="row"><span>Fuel</span><b>${rm(fu)}</b></div>
  <div class="row" style="border-top:1px solid var(--b);margin-top:8px;padding-top:8px"><span>Total</span><b>${rm(t)}</b></div>
  <h2>Fuel</h2>${list(S.fuel,f=>`<div class="row mut"><span>${fd(f.date)} · ${n(f.km)} km · ${f.litres} L</span><span>${rm(f.cost)}</span></div>`)}
  <h2>Other expenses</h2>${list(S.expenses,e=>`<div class="row mut"><span>${fd(e.date)} · ${esc(e.category)}</span><span>${rm(e.amount)}</span></div>`)}
  <h2>Data</h2><button class="mi" id="rules">Bike and intervals<span>›</span></button><button class="mi" id="xj">Back up (JSON)<span>›</span></button><button class="mi" id="xc">Export services (CSV)<span>›</span></button><button class="mi" id="imp">Import backup or legacy export<span>›</span></button>`}
function render(){tabs();$('#view').innerHTML={home,history,parts,more}[tab]();scrollTo(0,0)}
function svcSheet(id,pre){const s=S.services.find(x=>x.id===id)||{date:today(),km:'',type:'Regular Service',parts:pre||[],workshop:'FZR Motor',cost:'',notes:''};
  const P={'Regular service':['Engine Oil','Oil Filter','Gear Oil'],'Tyre change':['Front Tyre','Rear Tyre'],'Brake service':['Front Brake Pad','Rear Brake Pad','Brake Fluid']};
  const ws=[...new Set(S.services.map(x=>x.workshop).filter(Boolean))];
  sheet(`<div class="row"><h1>${id?'Edit service':'Log service'}</h1><button id="cl">✕</button></div><form id="f">
  <div class="two"><div><label for="d">Date</label><input id="d" type="date" required max="${today()}" value="${esc(s.date)}"></div><div><label for="k">Odometer (km)</label><input id="k" type="number" inputmode="numeric" min="0" required placeholder="Enter km" value="${esc(s.km)}"></div></div>
  <label>Quick select</label><div class="chips">${Object.keys(P).map(k=>`<button type="button" class="chip" data-pre="${k}">${k}</button>`).join('')}</div>
  <label>Parts changed</label><div class="chips" id="pc">${Object.keys(S.rules).map(p=>`<button type="button" class="chip ${s.parts.includes(p)?'on':''}" data-part="${esc(p)}" aria-pressed="${s.parts.includes(p)}">${esc(p)}</button>`).join('')}</div>
  <div class="two"><div><label for="c">Total cost (RM)</label><input id="c" type="number" step="0.01" min="0" required placeholder="0.00" value="${esc(s.cost)}"></div><div><label for="w">Workshop</label><input id="w" list="wl" value="${esc(s.workshop)}"><datalist id="wl">${ws.map(w=>`<option value="${esc(w)}">`).join('')}</datalist></div></div>
  <label for="t">Service type</label><input id="t" value="${esc(s.type)}"><label for="nt">Notes</label><input id="nt" value="${esc(s.notes)}">
  <div class="row" style="margin-top:18px">${id?'<button type="button" class="danger" id="del">Delete</button>':'<span></span>'}<button class="pri" style="padding:13px 26px">Save service</button></div></form>`);
  const sel=()=>[...document.querySelectorAll('[data-part].on')].map(b=>b.dataset.part);
  $('#cl').onclick=close;$('#pc').onclick=e=>{const b=e.target.closest('[data-part]');if(b){b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'))}};
  document.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-part]').forEach(c=>c.classList.toggle('on',P[b.dataset.pre].includes(c.dataset.part)));$('#t').value=b.dataset.pre==='Regular service'?'Regular Service':b.dataset.pre});
  if(id)$('#del').onclick=()=>{if(confirm('Delete this service record?')){S.services=S.services.filter(x=>x.id!==id);save();close();render()}};
  $('#f').onsubmit=e=>{e.preventDefault();const km=Math.round(+$('#k').value),date=$('#d').value,parts=sel();
    if(!parts.length&&!confirm('No parts selected. Save anyway?'))return;
    const prev=L.byDate(S.services).filter(x=>x.id!==id&&x.date<date).pop();
    if(prev&&km<prev.km&&!confirm(`${n(km)} km is lower than ${n(prev.km)} km on ${fd(prev.date)}. Save anyway? It will be flagged for review.`))return;
    const r={...s,id:id||'svc-'+Date.now(),date,km,type:$('#t').value.trim()||'Service',parts,workshop:$('#w').value.trim(),cost:+$('#c').value,notes:$('#nt').value.trim()};
    S.services=id?S.services.map(x=>x.id===id?r:x):[...S.services,r];
    if(date>=S.odo.date&&km>S.odo.km)S.odo={km,date,confirmed:true};save();close();render()}}
function odoSheet(){sheet(`<div class="row"><h1>Update odometer</h1><button id="cl">✕</button></div><form id="f"><div class="two"><div><label for="d">Date</label><input id="d" type="date" required max="${today()}" value="${today()}"></div><div><label for="k">Odometer (km)</label><input id="k" type="number" min="0" required placeholder="Enter km"></div></div><button class="pri" style="width:100%;margin-top:18px;padding:13px">Save odometer</button></form>`);
  $('#cl').onclick=close;$('#f').onsubmit=e=>{e.preventDefault();const km=Math.round(+$('#k').value);
    if(km<S.odo.km&&!confirm(`${n(km)} km is lower than the last reading (${n(S.odo.km)} km). Save anyway?`))return;S.odo={km,date:$('#d').value,confirmed:true};save();close();render()}}
function rulesSheet(){sheet(`<div class="row"><h1>Bike and intervals</h1><button id="cl">✕</button></div><p class="mut">Your own settings, not verified manufacturer values. Leave blank for no interval.</p><form id="f"><label for="si">Service interval (km)</label><input id="si" type="number" min="1" value="${S.vehicle.serviceIntervalKm}"><label for="wk">Warn before service (km)</label><input id="wk" type="number" min="0" value="${S.vehicle.warnKm}">
  ${Object.entries(S.rules).map(([k,v],i)=>`<label for="r${i}">${esc(k)} (km)</label><input id="r${i}" type="number" min="1" value="${v??''}">`).join('')}<button class="pri" style="width:100%;margin-top:18px;padding:13px">Save</button></form>`);
  $('#cl').onclick=close;$('#f').onsubmit=e=>{e.preventDefault();S.vehicle.serviceIntervalKm=+$('#si').value||3000;S.vehicle.warnKm=+$('#wk').value||0;
    Object.keys(S.rules).forEach((k,i)=>{const v=$('#r'+i).value;S.rules[k]=v?+v:null});save();close();render()}}
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()};
document.addEventListener('click',e=>{const t=e.target,r=t.closest('.hr[data-id]');
  if(r&&$('#view').contains(r))return svcSheet(r.dataset.id);if(t.dataset.p)return svcSheet(null,[t.dataset.p]);
  ({odo:odoSheet,rules:rulesSheet,imp:()=>$('#file').click(),xj:()=>dl(`moto-vault-backup-${today()}.json`,JSON.stringify(S,null,2),'application/json'),xc:()=>dl(`services-${today()}.csv`,L.csv(S),'text/csv')})[t.id]?.()});
document.addEventListener('input',e=>{if(e.target.id==='q'){const q=e.target.value.toLowerCase();$('#list').innerHTML=L.byDate(S.services).reverse().filter(s=>JSON.stringify(s).toLowerCase().includes(q)).map(s=>svcRow(s)).join('')}});
$('#file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;let j;try{j=JSON.parse(await f.text())}catch{return alert('That file is not valid JSON.')}
  const {state,report:r}=L.importMerge(S,j.services||j.data?j:{data:j}),a=r.added;
  if(!confirm(`Import preview\nNew: ${a.services} services, ${a.fuel} fuel, ${a.expenses} expenses\nAlready present: ${r.duplicates}\nConflicts (kept as is): ${r.conflicts.length}\nInvalid: ${r.invalid.length}\n\nImport the new records?`))return;
  S=state;save();render();alert(`Imported. ${r.conflicts.length?'Conflicting IDs were not overwritten: '+r.conflicts.map(c=>c.id).join(', '):'No conflicts.'}`)};
render();if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
