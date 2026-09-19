'use strict';
/* Rotary Core V3.0 — GAIA-derived integrity/supervision layer.
   Supervisory only: it does not classify page content and cannot hide DOM itself. */
(() => {
  const STATUS=Object.freeze({GREEN:'GREEN',AMBER:'AMBER',UNKNOWN:'UNKNOWN',UNRESOLVED:'UNRESOLVED',INSUFFICIENT:'INSUFFICIENT'});
  const now=()=>Date.now();
  const trim=(a,ms)=>{const t=now()-ms;while(a.length&&a[0]<t)a.shift();};
  const failures=[]; const actions=[]; const mutations=[];
  let degradedUntil=0;
  const Buffer=Object.freeze({
    mutation(n=1){const t=now();for(let i=0;i<Math.min(n,100);i++)mutations.push(t);trim(mutations,2000);if(mutations.length>3500)degradedUntil=Math.max(degradedUntil,t+1500);},
    action(){actions.push(now());trim(actions,10000);if(actions.length>500)degradedUntil=Math.max(degradedUntil,now()+1500);},
    storm(){trim(mutations,2000);trim(actions,10000);return now()<degradedUntil;},
    snapshot(){trim(mutations,2000);trim(actions,10000);return {mutations2s:mutations.length,actions10s:actions.length,storm:this.storm()};}
  });
  const Sentinel=Object.freeze({
    organFailure(name){failures.push(now());trim(failures,30000);if(failures.length>=3)degradedUntil=Math.max(degradedUntil,now()+3000);return {name,failures30s:failures.length};},
    health(){trim(failures,30000);return {status:Buffer.storm()||failures.length>=3?STATUS.AMBER:STATUS.GREEN,organFailures30s:failures.length,buffer:Buffer.snapshot()};}
  });
  function validateDecision(decision){
    if(!decision)return {accepted:false,state:STATUS.INSUFFICIENT,reason:'missing decision'};
    if(decision.state==='USER_HIDE')return {accepted:true,state:STATUS.GREEN,reason:'explicit user rule'};
    if(decision.state!=='HIDE')return {accepted:false,state:decision.state==='RECHECK'?STATUS.INSUFFICIENT:STATUS.UNKNOWN,reason:'no hide verdict'};
    const ev=Array.isArray(decision.evidence)?decision.evidence:[];
    const positive=ev.filter(e=>e&&e.polarity>0&&e.weight>0);
    if(decision.conflict)return {accepted:false,state:STATUS.UNRESOLVED,reason:'conflicting evidence'};
    const threshold=Number.isFinite(Number(decision.policyThreshold))?Math.max(0,Number(decision.policyThreshold)):6;
    if(!positive.length||Number(decision.score)<threshold)return {accepted:false,state:STATUS.INSUFFICIENT,reason:'insufficient positive evidence'};
    return {accepted:true,state:STATUS.GREEN,reason:'validated bounded hide verdict'};
  }

  function mirrorDecision(decision){
    if(!decision||decision.state!=='HIDE')return {accepted:false,state:STATUS.INSUFFICIENT,reason:'mirror: no hide verdict'};
    const ev=Array.isArray(decision.evidence)?decision.evidence.filter(e=>e&&e.weight>0):[];
    // Pre-V3 deterministic decisions lack the stress contract; preserve rollback compatibility
    // while V3 decisions are independently recomputed below.
    if(!decision.stress)return {accepted:true,state:STATUS.GREEN,reason:'mirror: legacy validated decision'};
    const best=new Map();
    for(const e of ev){const key=`${e.group}|${e.polarity}`;const prev=best.get(key);if(!prev||e.weight>prev.weight)best.set(key,e);}
    const clean=[...best.values()]; let positive=0,negative=0;
    const posGroups=new Set(), allGroups=new Set();
    for(const e of clean){allGroups.add(e.group);if(e.polarity>0){positive+=e.weight;posGroups.add(e.group);}else negative+=e.weight;}
    const corroboration=allGroups.size>=4?2:allGroups.size>=2?1:0;
    const score=Math.max(0,Math.min(20,positive+corroboration-negative));
    const hardNegative=clean.filter(e=>e.polarity<0&&String(e.group||'').startsWith('hard-contradiction:')).reduce((n,e)=>n+e.weight,0);
    const conflict=hardNegative>=3;
    if(conflict)return {accepted:false,state:STATUS.UNRESOLVED,reason:'mirror: conflicting evidence'};
    if(score!==Number(decision.score))return {accepted:false,state:STATUS.UNRESOLVED,reason:'mirror: score mismatch'};
    if(!posGroups.size)return {accepted:false,state:STATUS.INSUFFICIENT,reason:'mirror: no independent positive provenance'};
    return {accepted:true,state:STATUS.GREEN,reason:'mirror: decision independently consistent'};
  }
  function boundedTikTokTarget(el,r,vw,vh){
    let host='';try{host=String(location?.hostname||'').toLowerCase()}catch{}
    if(!(host==='tiktok.com'||host.endsWith('.tiktok.com')))return false;
    // Recompute the TikTok exception independently inside the Warden. This does not
    // trust the content-script candidate decision and preserves separation between
    // discovery/classification and action authorization.
    if(r.width<90||r.height<70)return false;
    const maxWidth=vw<760?vw*.98:Math.min(1000,vw*.84);
    if(r.width>maxWidth||r.height>Math.min(1050,vh*1.08))return false;
    if((r.width*r.height)>(vw*vh*.72))return false;
    let links=[];try{links=[...el.querySelectorAll?.('a[href*="/video/"]')||[]]}catch{}
    const unique=new Set(links.map(a=>(a.getAttribute?.('href')||'').split('?')[0]).filter(Boolean));
    if(unique.size>3)return false;
    let media=false;try{media=!!el.querySelector?.('video,img,picture,[style*="background-image"]')}catch{}
    if(!media)return false;
    return true;
  }
  function containerIntegrity(el){
    if(!el||!el.isConnected||typeof el.getBoundingClientRect!=='function')return {accepted:false,reason:'detached/invalid target'};
    const r=el.getBoundingClientRect(); const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1); const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
    if(r.width<8||r.height<8)return {accepted:false,reason:'degenerate target'};
    const tikTokBounded=boundedTikTokTarget(el,r,vw,vh);
    if(r.width>vw*.92&&r.height>vh*.48&&!tikTokBounded)return {accepted:false,reason:'oversized page-region target'};
    if((r.width*r.height)>(vw*vh*.45)&&!tikTokBounded)return {accepted:false,reason:'oversized area target'};
    return {accepted:true,reason:tikTokBounded?'bounded TikTok media target':'bounded container'};
  }
  function authorizeAction(el,d){
    const trust=globalThis.RotaryTrustV14;
    if(trust&&!trust.assertAuthority('warden','AUTHORIZE_ACTION').allowed)return {accepted:false,state:STATUS.UNKNOWN,reason:'Warden contract denies authorization'};
    if(Buffer.storm())return {accepted:false,state:STATUS.AMBER,reason:'supervisory storm/recovery hold'};
    const c=containerIntegrity(el);if(!c.accepted)return {accepted:false,state:STATUS.UNRESOLVED,reason:c.reason};
    // Direct user mutes and compact disclosure labels retain their existing deterministic path.
    if(d?.rotaryState==='USER_HIDE'||d?.category==='Muted word')return {accepted:true,state:STATUS.GREEN,reason:'user-authorized rule'};
    if(d?.category==='AI label')return {accepted:true,state:STATUS.GREEN,reason:'explicit disclosure label'};
    if(d?.rotaryDecision){const v=validateDecision(d.rotaryDecision);if(!v.accepted)return v;const m=mirrorDecision(d.rotaryDecision);if(!m.accepted)return m;}
    // Legacy/local deterministic rules are allowed only when they already produced a bounded target.
    else if(!['AI promotion','Scam claim'].includes(d?.category))return {accepted:false,state:STATUS.INSUFFICIENT,reason:'missing validated decision'};
    Buffer.action(); return {accepted:true,state:STATUS.GREEN,reason:'Warden authorized'};
  }
  globalThis.RotaryGaiaV14=Object.freeze({STATUS,Buffer,Sentinel,DecisionValidator:Object.freeze({validateDecision}),MirrorWarden:Object.freeze({validate:mirrorDecision}),Warden:Object.freeze({authorizeAction}),ContainerIntegrity:Object.freeze({check:containerIntegrity}),health:()=>Sentinel.health()});
})();
