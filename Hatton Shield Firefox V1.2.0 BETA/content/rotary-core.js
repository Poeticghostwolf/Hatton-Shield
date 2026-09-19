'use strict';
/* Rotary Core V3.0 — bounded multi-organ evidence fusion. Local only. */
(() => {
  const STATES=Object.freeze({ALLOW:'ALLOW',RECHECK:'RECHECK',HIDE:'HIDE',USER_HIDE:'USER_HIDE'});
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
  function evidence(organ,source,weight,reason,polarity=1,group=source){
    return {organ,source,group,weight:clamp(Number(weight)||0,0,8),reason:String(reason||''),polarity:polarity<0?-1:1};
  }
  function dedupe(items){
    const best=new Map();
    for(const e of items||[]){
      if(!e||!e.weight)continue;
      const key=`${e.group}|${e.polarity}`;
      const prev=best.get(key); if(!prev||e.weight>prev.weight)best.set(key,e);
    }
    return [...best.values()];
  }
  function stress(items){
    const raw=Array.isArray(items)?items.filter(Boolean):[];
    const ev=dedupe(raw);
    const rawGroups=new Set(raw.map(e=>e?.group).filter(Boolean));
    const groups=new Set(ev.map(e=>e?.group).filter(Boolean));
    const organs=new Set(ev.map(e=>e?.organ).filter(Boolean));
    const collapsed=Math.max(0,raw.length-ev.length);
    const concentration=ev.length?Math.max(...[...groups].map(g=>ev.filter(e=>e.group===g).length))/ev.length:0;
    return {evidence:ev,rawCount:raw.length,acceptedCount:ev.length,collapsed,independentGroups:groups.size,independentOrgans:organs.size,concentration:Number(concentration.toFixed(3)),status:collapsed>0?'STRESSED':'GREEN'};
  }
  function decisionThread(decision,meta={}){
    const ev=Array.isArray(decision?.evidence)?decision.evidence:[];
    return Object.freeze({version:'3.0',epoch:Number(meta.epoch||0),surface:String(meta.surface||'generic').slice(0,32),deepPass:!!meta.deepPass,state:decision?.state||STATES.ALLOW,score:Number(decision?.score||0),confidence:Number(decision?.confidence||0),groups:[...new Set(ev.map(e=>e?.group).filter(Boolean))].slice(0,16),organs:[...new Set(ev.map(e=>e?.organ).filter(Boolean))].slice(0,16),conflict:!!decision?.conflict,stress:decision?.stress?{rawCount:decision.stress.rawCount,acceptedCount:decision.stress.acceptedCount,collapsed:decision.stress.collapsed,independentGroups:decision.stress.independentGroups,independentOrgans:decision.stress.independentOrgans,concentration:decision.stress.concentration,status:decision.stress.status}:null});
  }
  function fuse(items,{hideAt=7,recheckAt=3,userRule=false}={}){
    const stressed=stress(items); const ev=stressed.evidence;
    if(userRule)return {state:STATES.USER_HIDE,score:99,confidence:1,evidence:ev,stress:stressed,policyThreshold:0,reasons:['explicit user rule']};
    let positive=0,negative=0; const groups=new Set(),organs=new Set();
    for(const e of ev){organs.add(e.organ);groups.add(e.group);if(e.polarity>0)positive+=e.weight;else negative+=e.weight;}
    // Corroboration is intentionally small; repeated observations from one source group cannot self-amplify.
    const independent=groups.size;
    const corroboration=independent>=4?2:independent>=2?1:0;
    const score=clamp(positive+corroboration-negative,0,20);
    const hardNegative=ev.filter(e=>e.polarity<0&&String(e.group||'').startsWith('hard-contradiction:')).reduce((n,e)=>n+e.weight,0);
    // V1.1.13: ordinary editorial/reference negatives reduce the score but do not
    // veto independently corroborated positives. Only an explicit hard contradiction
    // creates the conflict state. This keeps thresholds intact and preserves FP guards.
    const conflict=hardNegative>=3;
    const strongIndependent=ev.filter(e=>e.polarity>0&&e.weight>=4).map(e=>e.group).filter((x,i,a)=>a.indexOf(x)===i).length;
    let state=STATES.ALLOW;
    if(!conflict && score>=hideAt && (independent>=2||strongIndependent>=1))state=STATES.HIDE;
    else if(score>=recheckAt||conflict)state=STATES.RECHECK;
    return {state,score,confidence:clamp((score/10)+(independent>=2?.1:0),0,1),evidence:ev,organs:[...organs],independent,conflict,stress:stressed,policyThreshold:hideAt,reasons:ev.map(e=>e.reason).filter(Boolean)};
  }
  function rotateOrder(names,seed=''){
    const a=[...names]; if(a.length<2)return a;
    let h=2166136261; for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
    const shift=h%a.length; return a.slice(shift).concat(a.slice(0,shift));
  }
  function runOrgans(organs,ctx){
    const names=rotateOrder(Object.keys(organs),ctx?.fingerprint||ctx?.text||'rotary');
    const out=[];
    for(const name of names){try{const r=organs[name]?.(ctx);if(Array.isArray(r))out.push(...r);}catch{(globalThis.RotaryGaiaV14||globalThis.RotaryGaiaV13)?.Sentinel?.organFailure?.(name);/* isolated + supervised */}}
    return out;
  }
  globalThis.RotaryCoreV1=Object.freeze({STATES,norm,evidence,dedupe,stress,fuse,decisionThread,rotateOrder,runOrgans});
})();
