const day=d=>Date.parse(d+'T00:00:00Z')/864e5;
const addDays=(d,n)=>new Date((day(d)+n)*864e5).toISOString().slice(0,10);
export const byDate=a=>[...a].sort((x,y)=>x.date.localeCompare(y.date)||x.km-y.km);
// Out-of-order odometer readings are flagged (both sides), never changed.
export function flagged(services){const f=new Set();let mx=null;
  for(const s of byDate(services)){ if(mx&&s.km<mx.km){f.add(s.id);f.add(mx.id)} else mx=s }
  return f}
export function lastChange(services,part){return byDate(services).filter(s=>s.parts.includes(part)).pop()||null}
export function pace(S){const bad=flagged(S.services);
  const pts=[...S.services.filter(s=>!bad.has(s.id)),...S.fuel,{date:S.odo.date,km:S.odo.km}].sort((a,b)=>a.date.localeCompare(b.date));
  if(pts.length<2)return null;const a=pts[0],z=pts[pts.length-1];if(day(z.date)<=day(a.date))return null;
  const all=(z.km-a.km)/(day(z.date)-day(a.date));
  const r=pts.filter(p=>day(z.date)-day(p.date)<=90);const b=r[0];
  const rec=day(z.date)>day(b.date)?(z.km-b.km)/(day(z.date)-day(b.date)):all;
  return [Math.min(all,rec),Math.max(all,rec)].filter(v=>v>0)}
export function nextService(S){const last=lastChange(S.services,'Engine Oil');if(!last)return null;
  const dueKm=last.km+S.vehicle.serviceIntervalKm,remaining=dueKm-S.odo.km,p=pace(S);let eta=null;
  if(remaining>0&&p&&p.length)eta=[addDays(S.odo.date,Math.round(remaining/Math.max(...p))),addDays(S.odo.date,Math.round(remaining/Math.min(...p)))];
  return{last,dueKm,remaining,eta}}
export function partsStatus(S){return Object.entries(S.rules).map(([name,interval])=>{const l=lastChange(S.services,name);
  return{name,interval,last:l,dueKm:l&&interval?l.km+interval:null,left:l&&interval?l.km+interval-S.odo.km:null}})}
const st=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort()):v);
const same=(a,b)=>st(a)===st(b);
function norm(kind,r){ if(r&&typeof r.id==='number') { const b={...r,id:'L-'+kind+'-'+r.id,legacyId:r.id};if('mileage' in r){b.km=r.mileage;delete b.mileage}
    if(kind==='svc'){b.parts=r.changedParts||[];delete b.changedParts}
    if(kind==='fuel'){b.cost=r.price;delete b.price} return b } return r }
// Safe merge: duplicates skipped, conflicting IDs reported and left untouched, nothing overwritten.
export function importMerge(S,json){const d=json.data||json,rep={added:{},duplicates:0,conflicts:[],invalid:[]};
  const out=structuredClone(S);
  for(const [col,kind] of [['services','svc'],['fuel','fuel'],['expenses','exp']]){rep.added[col]=0;
    for(const raw of d[col]||[]){const r=norm(kind,raw);
      if(!r||!r.date||!(r.km>=0||r.amount>=0)){rep.invalid.push({col,id:raw&&raw.id});continue}
      const ex=out[col].find(x=>x.id===r.id);
      if(!ex){out[col].push(r);rep.added[col]++} else if(same(ex,r))rep.duplicates++; else rep.conflicts.push({col,id:r.id})}}
  for(const [k,v] of Object.entries(d.partIntervals||d.rules||{})){ if(!(k in out.rules))out.rules[k]=v; else if(out.rules[k]!==v)rep.conflicts.push({col:'rules',id:k})}
  return{state:out,report:rep}}
export const total=a=>a.reduce((s,x)=>s+(+x.cost||+x.amount||0),0);
export function csv(S){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  return ['date,odometer_km,type,parts,workshop,cost_rm,notes',...byDate(S.services).map(s=>[s.date,s.km,s.type,s.parts.join('; '),s.workshop,s.cost,s.notes].map(q).join(','))].join('\n')}
