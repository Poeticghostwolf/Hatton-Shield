'use strict';
/* Rotary Core V1.4 — GAIA V7.1 trust/outcome adaptation.
   Local assurance only. Contracts constrain authority; shadow observers have zero verdict weight. */
(() => {
  const MATURITY=Object.freeze(['SHADOW','OBSERVED','VALIDATED','TRUSTED']);
  const freezeDeep=v=>{if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.freeze(v);for(const c of Object.values(v))freezeDeep(c);return v;};
  const def=(x)=>freezeDeep({authority:'ADVISORY',canScore:false,canChangeDecision:false,canAuthorizeAction:false,canModifyDOM:false,canPersistRawText:false,failureMode:'DEGRADE_AND_REPORT',maturity:'OBSERVED',...x});
  const CONTRACTS=freezeDeep({
    text:def({organId:'text',purpose:'Visible-text evidence',canScore:true,authority:'EVIDENCE',maturity:'TRUSTED'}),
    metadata:def({organId:'metadata',purpose:'Bounded DOM/ARIA/link metadata evidence',canScore:true,authority:'EVIDENCE',maturity:'VALIDATED'}),
    intent:def({organId:'intent',purpose:'Source/intent classification evidence',canScore:true,authority:'EVIDENCE',maturity:'VALIDATED'}),
    structure:def({organId:'structure',purpose:'Bounded structural evidence',canScore:true,authority:'EVIDENCE',maturity:'VALIDATED'}),
    source:def({organId:'source',purpose:'Destination/source corroboration',canScore:true,authority:'EVIDENCE',maturity:'VALIDATED'}),
    integrity:def({organId:'integrity',purpose:'Contradiction/false-positive guards',canScore:true,authority:'EVIDENCE',maturity:'VALIDATED'}),
    guardProtocol:def({organId:'guardProtocol',purpose:'Guard-ensemble AI classification/policy evidence; no action authority',canScore:true,authority:'EVIDENCE',maturity:'OBSERVED'}),
    fusion:def({organId:'fusion',purpose:'Provenance-aware evidence fusion',canScore:true,canChangeDecision:true,authority:'DECISION',maturity:'TRUSTED'}),
    validator:def({organId:'validator',purpose:'Independent decision validation',authority:'VALIDATOR',maturity:'VALIDATED'}),
    sentinel:def({organId:'sentinel',purpose:'Cross-organ health supervision',authority:'SUPERVISORY',maturity:'VALIDATED'}),
    buffer:def({organId:'buffer',purpose:'Mutation/action storm limiting',authority:'SUPERVISORY',maturity:'VALIDATED'}),
    warden:def({organId:'warden',purpose:'Sole authorization boundary before page action',canAuthorizeAction:true,authority:'AUTHORIZATION',maturity:'VALIDATED'}),
    action:def({organId:'action',purpose:'Execute an already-authorized bounded DOM change',canModifyDOM:true,authority:'EXECUTION',maturity:'TRUSTED'}),
    outcomeMonitor:def({organId:'outcomeMonitor',purpose:'Bounded post-decision reliability metadata',authority:'POST_DECISION_OBSERVER',maturity:'SHADOW'}),
    shadowDiagnostics:def({organId:'shadowDiagnostics',purpose:'Observe assurance signals with zero decision weight',authority:'SHADOW_ONLY',maturity:'SHADOW',failureMode:'DROP_SHADOW_OUTPUT_AND_REPORT'})
  });
  const getContract=id=>CONTRACTS[id]||null;
  const capability=(id,cap)=>{const c=getContract(id);if(!c)return false;return ({SCORE:c.canScore,CHANGE_DECISION:c.canChangeDecision,AUTHORIZE_ACTION:c.canAuthorizeAction,MODIFY_DOM:c.canModifyDOM,PERSIST_RAW_TEXT:c.canPersistRawText})[cap]===true;};
  const maturity=new Map(Object.values(CONTRACTS).map(c=>[c.organId,Object.freeze({organId:c.organId,level:c.maturity,eligibleFor:null,evidenceCount:0})]));
  function noteValidationEvidence(id){const cur=maturity.get(id)||Object.freeze({organId:id,level:'SHADOW',eligibleFor:null,evidenceCount:0});const i=MATURITY.indexOf(cur.level);const eligibleFor=i>=0&&i<MATURITY.length-1?MATURITY[i+1]:null;const n=Object.freeze({...cur,eligibleFor,evidenceCount:cur.evidenceCount+1});maturity.set(id,n);return n;}
  function promoteMaturity(id,target,approval={}){const cur=maturity.get(id);if(!cur||cur.eligibleFor!==target||approval.explicitApproval!==true||!approval.approvedBy)throw new Error('explicit one-step approval required');const n=Object.freeze({...cur,level:target,eligibleFor:null,promotedBy:String(approval.approvedBy).slice(0,80)});maturity.set(id,n);return n;}
  const outcomes=[]; const MAX_OUTCOMES=200;
  function recordOutcome(decision,meta={}){const r=freezeDeep({at:Date.now(),decision:{state:String(decision?.state||'UNKNOWN').slice(0,20),score:Number(decision?.score)||0,confidence:Number(decision?.confidence)||0,conflict:decision?.conflict===true},contributors:Array.isArray(decision?.organs)?decision.organs.slice(0,12).map(x=>String(x).slice(0,40)):[],surface:String(meta.surface||'').slice(0,24),reasonCode:String(meta.reasonCode||'').slice(0,48),rawTextStored:false});outcomes.push(r);if(outcomes.length>MAX_OUTCOMES)outcomes.splice(0,outcomes.length-MAX_OUTCOMES);return r;}
  function shadowObserve(decision,meta={}){return freezeDeep({verdictWeight:0,decisionState:String(decision?.state||'UNKNOWN'),hasConflict:decision?.conflict===true,organCount:Array.isArray(decision?.organs)?decision.organs.length:0,surface:String(meta.surface||'').slice(0,24)});}
  globalThis.RotaryTrustV14=Object.freeze({CONTRACTS,getContract,assertAuthority:(id,cap)=>Object.freeze({allowed:capability(id,cap),organId:id,capability:cap}),Maturity:Object.freeze({levels:MATURITY,get:id=>maturity.get(id)||null,noteValidationEvidence,promoteMaturity}),OutcomeMonitor:Object.freeze({record:recordOutcome,list:()=>outcomes.slice()}),ShadowDiagnostics:Object.freeze({observe:shadowObserve})});
})();
