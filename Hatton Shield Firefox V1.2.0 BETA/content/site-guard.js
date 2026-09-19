(function(){
'use strict';
const api=globalThis.browser||globalThis.chrome;
const rules=globalThis.HattonSiteGuardRules;
if(!api?.storage?.local||!rules||window.top!==window)return;
const match=rules.lookupHost(location.hostname);
if(!match)return;
function storageGet(keys){
 try{const r=api.storage.local.get(keys);if(r&&typeof r.then==='function')return r;}catch{}
 return new Promise(resolve=>{try{api.storage.local.get(keys,v=>resolve(v||{}));}catch{resolve({});}});
}
async function guardAllowed(){
 try{const r=await api.runtime.sendMessage({type:'HATTON_SITE_GUARD_CHECK',host:location.hostname});return r?.ok===true&&r.allowed===true}catch{return false}
}
async function allowTab(){
 try{const r=await api.runtime.sendMessage({type:'HATTON_SITE_GUARD_ALLOW',host:location.hostname});return r?.ok===true&&r.allowed===true}catch{return false}
}
function safeBack(){try{if(history.length>1){history.back();return;}location.replace('about:blank');}catch{}}
function el(tag,{className,id,type,text}={}){
 const n=document.createElement(tag);
 if(className)n.className=className;if(id)n.id=id;if(type)n.type=type;if(text!=null)n.textContent=String(text);
 return n;
}
function showGuard(){
 try{window.stop();}catch{}
 const head=document.createElement('head');
 const charset=document.createElement('meta');charset.setAttribute('charset','utf-8');
 const viewport=document.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';
 const title=el('title',{text:'Hatton Shield — AI site guard'});
 const style=el('style');style.textContent=':root{color-scheme:dark}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#07111d;color:#f4f8fc;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}body{min-height:100vh;display:grid;place-items:center;padding:24px}.hs{width:min(640px,100%);border:1px solid #1c4f78;border-radius:22px;background:linear-gradient(160deg,#0d2035,#091521);padding:28px;box-shadow:0 24px 70px #0009}.brand{font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#69baff}.hs h1{font-size:30px;line-height:1.1;margin:10px 0}.host{display:inline-block;margin:7px 0 15px;padding:6px 10px;border:1px solid #285678;border-radius:9px;background:#07131f;color:#bfe1ff}.hs p{color:#b8cad9}.note{font-size:13px;color:#86a3ba}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.actions button{appearance:none;border:1px solid #318fd8;border-radius:11px;padding:10px 15px;font:inherit;font-weight:750;cursor:pointer}.back{background:#168cff;color:white}.allow{background:#0a1b2b;color:#dff1ff}.foot{margin-top:18px;font-size:12px;color:#728ea5}';
 head.append(charset,viewport,title,style);

 const body=document.createElement('body'),main=el('main',{className:'hs'});main.setAttribute('data-rotary-ui','1');
 main.append(el('div',{className:'brand',text:'Hatton Shield · Zero-AI'}),el('h1',{text:'Known AI-service site'}),el('div',{className:'host',text:location.hostname}));
 const p1=el('p');p1.append(document.createTextNode('This destination is classified as '),el('b',{text:match.category||'AI service'}),document.createTextNode('. Hatton Shield has paused the page before normal browsing continues.'));
 const p2=el('p',{className:'note',text:'This guard applies to known AI-first service destinations. It does not mean every page that discusses AI is AI-generated.'});
 const actions=el('div',{className:'actions'});
 const back=el('button',{className:'back',id:'hsBack',type:'button',text:'Go back'});
 const allow=el('button',{className:'allow',id:'hsAllow',type:'button',text:'Allow for this tab'});
 actions.append(back,allow);
 main.append(p1,p2,actions,el('div',{className:'foot',text:'Local guard · No telemetry · Close the tab to clear the temporary allowance'}));
 body.append(main);
 document.documentElement.replaceChildren(head,body);
 back.addEventListener('click',safeBack);
 allow.addEventListener('click',async()=>{if(await allowTab())location.reload();});
}
(async()=>{const s=await storageGet(['enabled','aiSiteBlock']);if(s.enabled===false||s.aiSiteBlock!==true||await guardAllowed())return;showGuard();})().catch(()=>{});
})();
