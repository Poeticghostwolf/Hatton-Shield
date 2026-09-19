'use strict';
const DEFAULTS={enabled:true,level:'zero-ai',explain:true,placeholderMode:'minimal',placeholderDensity:'normal',placeholderTreatment:'blur',categories:{aiContent:true,aiLabels:true,aiPromotion:true,scamClaims:false,sensitiveTerms:false},mutedWords:[],socialSites:{youtube:true,tiktok:true,instagram:true,facebook:true,threads:true,x:true,reddit:true,linkedin:true,twitch:true,discord:true,pinterest:true,bluesky:true,mastodon:true,tumblr:true},aiSiteBlock:false};
const TYPES=new Set(['ROTARY_GET_STATE','HATTON_SITE_GUARD_CHECK','HATTON_SITE_GUARD_ALLOW']);
const guardAllowMemory=new Map();
function safeHost(v){try{return new URL(`https://${String(v||'').trim()}`).hostname.toLowerCase()}catch{return ''}}
function senderHost(sender){try{return new URL(sender?.url||'').hostname.toLowerCase()}catch{return ''}}
function guardKey(tabId){return `hattonGuardAllow:${tabId}`}
async function sessionGet(key){
 if(browser.storage?.session){try{return await browser.storage.session.get(key)}catch{}}
 return {[key]:guardAllowMemory.get(key)};
}
async function sessionSet(key,value){
 if(browser.storage?.session){try{await browser.storage.session.set({[key]:value});return}catch{}}
 guardAllowMemory.set(key,value);
}
async function sessionRemove(key){
 if(browser.storage?.session){try{await browser.storage.session.remove(key)}catch{}}
 guardAllowMemory.delete(key);
}
async function state(){
 const s=await browser.storage.local.get();
 const density=['normal','minimal','clean'].includes(s.placeholderDensity)?s.placeholderDensity:DEFAULTS.placeholderDensity;
 const treatment=['blur','shield'].includes(s.placeholderTreatment)?s.placeholderTreatment:DEFAULTS.placeholderTreatment;
 return {
  enabled:s.enabled!==false,
  level:'zero-ai',
  explain:s.explain!==false,
  placeholderMode:s.placeholderMode==='compact'?'compact':'minimal',
  placeholderDensity:density,
  placeholderTreatment:treatment,
  categories:{...DEFAULTS.categories,...(s.categories||{})},
  mutedWords:Array.isArray(s.mutedWords)?s.mutedWords.slice(0,100):[],
  socialSites:{...DEFAULTS.socialSites,...(s.socialSites||{})},
  aiSiteBlock:s.aiSiteBlock===true
 };
}
const MIGRATION_VERSION=1200;
async function migrate(){const m=await browser.storage.local.get(['hattonMigrationVersion']);if((m.hattonMigrationVersion||0)>=MIGRATION_VERSION)return;const cfg=await state();await browser.storage.local.remove(['recent','survivors','stats','diagnostics','aiSiteGuard']);await browser.storage.local.set({...cfg,hattonMigrationVersion:MIGRATION_VERSION});}
browser.runtime.onInstalled.addListener(()=>{migrate().catch(()=>{});});
migrate().catch(()=>{});
browser.runtime.onMessage.addListener(async(msg,sender)=>{
 if(sender?.id&&sender.id!==browser.runtime.id)return {ok:false};
 if(!msg||typeof msg.type!=='string'||!TYPES.has(msg.type))return {ok:false};
 if(msg.type==='ROTARY_GET_STATE')return {ok:true,state:await state()};
 if(msg.type==='HATTON_SITE_GUARD_CHECK'||msg.type==='HATTON_SITE_GUARD_ALLOW'){
  const tabId=sender?.tab?.id,host=safeHost(msg.host),originHost=senderHost(sender);
  if(!Number.isInteger(tabId)||!host||(originHost&&originHost!==host))return {ok:false,allowed:false};
  const key=guardKey(tabId);
  if(msg.type==='HATTON_SITE_GUARD_ALLOW'){await sessionSet(key,host);return {ok:true,allowed:true};}
  const stored=await sessionGet(key);return {ok:true,allowed:stored?.[key]===host};
 }
 return {ok:false};
});
try{browser.tabs?.onRemoved?.addListener(tabId=>{sessionRemove(guardKey(tabId)).catch(()=>{});});}catch{}
