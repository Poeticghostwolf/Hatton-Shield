'use strict';
/*
 Hatton Shield v1.1.26 — TikTok Canonical Evidence Closure
 Local visible-text detector with bounded evidence localisation.
 No screenshots, form values, cookies, page bodies, network uploads, remote code, or cloud classifier.
*/
const AI_LABELS=[
 'ai-generated','ai generated','ai-created','ai created','generated with ai','generated using ai','made with ai','made using ai','created with ai','created using ai',
 'synthetic media','altered with ai','imagined with ai','ai-assisted','ai assisted','ai info'
];
const AI_PROMO=[
 'ai generator','generate images with ai','ai image generator','ai video generator',
 'create with ai','powered by ai','generate ai images','free ai image generator'
];
const PROMO_CUES=['free','try','start','get started','create','generate','generator','generative','make','launch','use','new'];

const AI_MEDIA_EXPLICIT=[
 'ai-generated image','ai generated image','ai-generated photo','ai generated photo','ai-generated art','ai generated art','ai-generated illustration','ai generated illustration',
 'ai-generated video','ai generated video','ai-created video','ai created video','synthetic video','ai-generated animation','ai generated animation',
 'ai-generated audio','ai generated audio','ai-generated music','ai generated music','ai-generated song','ai generated song','ai voice','synthetic voice','voice clone','ai cover',
 'ai-generated text','ai generated text','ai-written','ai written','synthetic media'
];
const AI_GENERATOR_CROSSMEDIA=[
 'ai image generator','ai art generator','ai photo generator','ai video generator','ai animation generator','ai music generator','ai song generator','ai voice generator','ai text generator',
 'text-to-image','text to image','text-to-video','text to video','image-to-video','image to video','text-to-speech','text to speech','voice cloning','voice clone'
];
const AI_REFERENCE_CUES=['how to spot','how to detect','detect ai','detection','what is','what does','explained','news','report','research','study','policy','copyright','regulation','ethics','future of','year ahead','history of','for dummies','understanding'];
function crossMediaClassify(text){
 text=norm(text); if(!text)return null;
 const explicit=hasAny(text,AI_MEDIA_EXPLICIT)||/\b(generated|created|made|produced) (by|with|using) (ai|artificial intelligence)\b/.test(text);
 const generator=hasAny(text,AI_GENERATOR_CROSSMEDIA)||/\b(ai|artificial intelligence)\s+(image|art|photo|video|animation|music|song|audio|voice|text)\s+(generator|maker|creator)\b/.test(text);
 const reference=hasAny(text,AI_REFERENCE_CUES);
 if(explicit&&!reference)return {category:'AI-generated media',reason:'Explicit cross-media AI/synthetic generation evidence'};
 if(generator&&!reference)return {category:'AI generator',reason:'Explicit AI generation service/modality evidence'};
 return null;
}

const SCAM=['guaranteed returns','risk-free investment','double your money','send crypto','urgent payment required'];
const PROTECTED='html,body,main,nav,header,footer,form,[role="main"],[role="navigation"],[role="banner"],[role="contentinfo"]';
const TARGETS='article,[role="article"],li,figure,[data-testid*="post"],[data-e2e*="feed"],section,p,h1,h2,h3,h4,[role="heading"],a[href],button,[aria-label],[aria-description],[title],img[alt],picture';
const VIEWPORT_TARGETS='article,[role="article"],li,figure,ytd-rich-item-renderer,ytd-video-renderer,ytd-reel-item-renderer,ytm-video-with-context-renderer,ytm-compact-video-renderer,ytm-reel-item-renderer,[data-e2e*="video-card"],[data-e2e*="search-item"],[data-e2e*="feed-item"],[data-e2e*="post-item"]';
// HATTON 1.1.13 CONFLICT REPAIR — public trace UI removed.
// HATTON 1.1.14 SURVIVOR CLOSURE — dynamic priority/timing repair layered above the V1.1.13 decision order.
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim()}
// V1.1.5 bounded evasion normalizer. Evidence preparation only: no hide,
// scoring, authorization, or threshold authority lives here.
function normalizeEvasionText(input){
 let t=String(input||''); try{t=t.normalize('NFKC')}catch(_e){}
 t=t.toLowerCase().replace(/[\u200b-\u200f\u2060\ufeff]/g,'').replace(/[\u2010-\u2015\u2212]/g,'-');
 t=t.replace(/(^|[^a-z0-9])a[\s._•·*~:\-/]{1,4}i(?=$|[^a-z0-9])/g,'$1ai')
    .replace(/\bgen[\s._\-/]*ai\b/g,'generative ai')
    .replace(/\ba[\s._\-/]*i[\s._\-/]*gen(?:erated)?\b/g,'ai generated')
    .replace(/\bsynth[\s._\-/]+media\b/g,'synthetic media')
    .replace(/\bdeep[\s._\-/]+fake\b/g,'deepfake')
    .replace(/\btext[\s._\-/]+to[\s._\-/]+image\b/g,'text-to-image')
    .replace(/\btext[\s._\-/]+to[\s._\-/]+video\b/g,'text-to-video')
    .replace(/\bimage[\s._\-/]+to[\s._\-/]+video\b/g,'image-to-video')
    .replace(/\b(?:made|created|edited|remade)[\s._\-/]+(?:with|using)[\s._\-/]+a[\s._\-/]*i\b/g,m=>m.replace(/[._\-/]+/g,' '))
    .replace(/\bgenerated[\s._\-/]+(?:by|with|using)[\s._\-/]+a[\s._\-/]*i\b/g,m=>m.replace(/[._\-/]+/g,' '))
    .replace(/\bai[\s._\-/]+(?:vid|video|film|movie|pic|photo|image|art|voice|song|music|story|edit|filter|clone|avatar)s?\b/g,m=>m.replace(/[._\-/]+/g,' '))
    .replace(/\b(?:txt|text)[\s._\-/]+2[\s._\-/]+(?:img|image)\b/g,'text-to-image')
    .replace(/\b(?:txt|text)[\s._\-/]+2[\s._\-/]+(?:vid|video)\b/g,'text-to-video')
    .replace(/\b(?:img|image)[\s._\-/]+2[\s._\-/]+(?:vid|video)\b/g,'image-to-video');
 return norm(t);
}
function directText(el){
 if(!el || el.closest('input,textarea,[contenteditable="true"]') || el.closest('.rotary-hidden-card')) return '';
 // Critical anti-cascade rule: Rotary's own explanation text is never detector evidence.
 if(el.classList?.contains('rotary-shield-note') || el.querySelector?.(':scope > .rotary-shield-note')) return '';
 let bits=[];
 for(const n of el.childNodes||[]){if(n.nodeType===Node.TEXT_NODE)bits.push(n.textContent||'');}
 for(const a of ['aria-label','title','alt']){const v=el.getAttribute?.(a);if(v)bits.push(v);}
 return norm(bits.join(' ').slice(0,900));
}
function hasAny(text,arr){return arr.some(x=>text.includes(x))}
function matchedPhrase(text,arr){return arr.find(x=>text.includes(x))||''}
function interactiveContext(el){
 const box=el.closest('form,[role="dialog"],[role="application"]');
 if(box) return true;
 const parent=el.parentElement;
 return !!parent?.querySelector('textarea,input,[contenteditable="true"],[role="textbox"]');
}
function promotionContext(el,text){
 // Mentions/discussion are not promotions. Require a promotional phrase plus an actionable/commercial context.
 if(interactiveContext(el)) return false;
 // Google PAA/AI Overview are structured surfaces: never let the generic direct-text rule
 // hide a question/link fragment before the bounded Google Core resolver sees the whole unit.
 if(isGoogleSearch()&&['paa','ai-overview'].includes(googleSpecialSection(el))) return false;
 const actionable=!!(el.matches?.('a,button') || el.closest?.('a,button') || el.querySelector?.('a,button'));
 const cue=hasAny(text,PROMO_CUES);
 return actionable && cue;
}
function labelContext(text){
 const p=matchedPhrase(text,AI_LABELS); if(!p)return false;
 // Genuine disclosure badges/labels are compact. Long prose discussing AI is not a label.
 return text.length<=Math.max(120,p.length+70);
}
function mutedProtected(el){
 return !!el?.closest?.('pre,code,kbd,samp,input,textarea,select,option,[contenteditable=\"true\"],[role=\"textbox\"],[data-rotary-ui],.rotary-shield-note');
}
function decide(text,s,el){
 const hits=[];
 const cm=s.categories.aiContent!==false?crossMediaClassify(text):null; if(cm&&!interactiveContext(el)) hits.push([cm.category,cm.reason]);
 if(s.categories.aiLabels && labelContext(text)) hits.push(['AI label','Visible AI/synthetic-media label']);
 if(s.categories.aiPromotion && hasAny(text,AI_PROMO) && promotionContext(el,text)) hits.push(['AI promotion','Visible AI-generation promotion']);
 if(s.categories.scamClaims && hasAny(text,SCAM)) hits.push(['Scam claim','Configured high-risk claim']);
 // RGP generic path: only a FILTER recommendation is accepted here; WATCH/CONFLICT stay visible.
 const rgp=s.categories.aiContent!==false?globalThis.RotaryGuardV2?.evaluate?.({text,sensitivity:s.level||'extreme',actionable:!!(el.matches?.('a,button')||el.closest?.('a,button')||el.querySelector?.('a,button'))}):null;
 if(rgp?.action==='FILTER'&&!interactiveContext(el)){
   const cat=rgp.kind==='AI_GENERATOR'?'AI generator':rgp.kind==='AI_PROMOTION'?'AI promotion':'AI-generated media';
   hits.push([cat,`RGP V2.2: ${rgp.evidence.filter(x=>x.polarity>0).slice(0,2).map(x=>x.reason).join(', ')}`]);
 }
 if(!mutedProtected(el)){for(const w of s.mutedWords||[]){const x=norm(w);if(x&&text.includes(x)){hits.push(['Muted word',`Matched "${x.slice(0,60)}"`]);break;}}}
 if(!hits.length)return null;
 return {category:hits[0][0],reason:hits.map(x=>x[1]).join('; ')};
}

// Hatton Shield Social Adapters V1.1 — bounded first-party platform evidence only.
function socialPlatform(){
 const h=location.hostname.toLowerCase();
 if(h==='youtube.com'||h.endsWith('.youtube.com')||h==='youtu.be')return 'youtube';
 if(h==='tiktok.com'||h.endsWith('.tiktok.com'))return 'tiktok';
 if(h==='instagram.com'||h.endsWith('.instagram.com'))return 'instagram';
 if(h==='facebook.com'||h.endsWith('.facebook.com'))return 'facebook';
 if(h==='threads.com'||h.endsWith('.threads.com')||h==='threads.net'||h.endsWith('.threads.net'))return 'threads';
 if(h==='x.com'||h.endsWith('.x.com')||h==='twitter.com'||h.endsWith('.twitter.com'))return 'x';
 if(h==='reddit.com'||h.endsWith('.reddit.com'))return 'reddit';
 if(h==='linkedin.com'||h.endsWith('.linkedin.com'))return 'linkedin';
 if(h==='twitch.tv'||h.endsWith('.twitch.tv'))return 'twitch';
 if(h==='discord.com'||h.endsWith('.discord.com'))return 'discord';
 if(h==='pinterest.com'||h.endsWith('.pinterest.com'))return 'pinterest';
 if(h==='bsky.app'||h==='app.bsky.app'||h.endsWith('.bsky.app'))return 'bluesky';
 if(h==='tumblr.com'||h.endsWith('.tumblr.com'))return 'tumblr';
 if(h==='mastodon.social'||h.endsWith('.mastodon.social')||h==='mastodon.online'||h.endsWith('.mastodon.online'))return 'mastodon';
 return '';
}
function socialCardSelector(p=socialPlatform()){
 if(p==='youtube')return 'ytd-rich-item-renderer,ytd-video-renderer,ytd-grid-video-renderer,ytd-compact-video-renderer,ytd-reel-item-renderer,ytd-reel-video-renderer,ytd-playlist-video-renderer,ytm-video-with-context-renderer,ytm-compact-video-renderer,ytm-reel-item-renderer,[role="article"]';
 if(p==='tiktok')return 'article[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item"],[data-e2e="search-card-container"],[data-e2e="user-post-item"],[data-e2e*="video-card"],[data-e2e*="feed-item"],[data-e2e*="search-item"],[data-e2e*="post-item"],article,[role="article"]';
 if(p==='x')return 'article[data-testid="tweet"],article,[role="article"]';
 if(p==='reddit')return 'shreddit-post,article,[data-testid="post-container"],[role="article"]';
 if(p==='linkedin')return '.feed-shared-update-v2,article,[data-urn*="activity"],[role="article"]';
 if(p==='facebook')return '[role="article"],article,[data-pagelet*="FeedUnit"]';
 if(p==='instagram'||p==='threads')return 'article,[role="article"]';
 if(p==='twitch')return '[data-a-target="video-card"],[data-test-selector*="video-card"],[data-test-selector*="clip-card"],article,[role="article"]';
 if(p==='discord')return 'li[id^="chat-messages-"],[id^="chat-messages-"][role="listitem"],[data-list-item-id^="chat-messages"]';
 if(p==='pinterest')return '[data-test-id="pin"],[data-test-id="pinWrapper"],article,[role="article"]';
 if(p==='bluesky')return 'article,[role="article"],[data-testid*="post"]';
 if(p==='mastodon')return 'article.status,.status,article,[role="article"]';
 if(p==='tumblr')return 'article,[data-testid*="post"],[role="article"]';
 return '';
}
function socialSeedSelector(p=socialPlatform()){
 const card=socialCardSelector(p);
 if(p==='twitch')return `${card},a[href*="/videos/"],a[href*="/clip/"],a[href*="/clips/"],[data-a-target*="preview-card"],[data-a-target*="title"]`;
 if(p==='discord')return `${card},[id^="message-content-"],[id^="message-accessories-"],[aria-label*="message"]`;
 if(p==='pinterest')return `${card},a[href*="/pin/"]`;
 if(p==='bluesky')return `${card},a[href*="/profile/"][href*="/post/"]`;
 return card;
}
function socialEnabled(s,p=socialPlatform()){
 if(!p)return false; const sites=s?.socialSites||{}; return sites[p]!==false;
}
function tiktokTargetSane(el){
 if(!el||!el.isConnected||el.matches?.(PROTECTED)||el.closest?.('.rotary-hidden-card')||el.querySelector?.(':scope > .rotary-shield-note'))return false;
 const r=el.getBoundingClientRect();
 const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
 const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
 // TikTok feed media is intentionally much larger than an ordinary result card.
 // Keep a platform-specific bounded action target instead of applying the generic
 // 42%-viewport cap, while still refusing page/feed-sized wrappers.
 if(r.width<90||r.height<70)return false;
 const maxWidth=vw<760?vw*.98:Math.min(1000,vw*.84);
 if(r.width>maxWidth||r.height>Math.min(1050,vh*1.08))return false;
 if((r.width*r.height)>(vw*vh*.72))return false;
 const links=[...el.querySelectorAll?.('a[href*="/video/"]')||[]];
 const unique=new Set(links.map(a=>(a.getAttribute('href')||'').split('?')[0]).filter(Boolean));
 if(unique.size>3)return false;
 return true;
}
function tiktokVideoCardFallback(source){
 // TikTok changes data-e2e names frequently. Treat those attributes as hints, not
 // as the only route into the working V1.1.x pipeline. Starting from any bounded
 // descendant, walk upward and select the smallest sane container that owns a
 // TikTok /video/ link plus media/text evidence. Platform failure never rejects
 // the base candidate; this function only enriches discovery.
 let cur=source;
 for(let i=0;i<9&&cur;i++,cur=cur.parentElement){
   if(cur.matches?.(PROTECTED)||!tiktokTargetSane(cur))continue;
   const links=[...cur.querySelectorAll?.('a[href*="/video/"]')||[]];
   if(!links.length)continue;
   const r=cur.getBoundingClientRect();
   const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
   const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
   if(r.width<120||r.height<120||r.width>Math.min(900,vw*.72)||r.height>Math.min(900,vh*.92))continue;
   const media=!!cur.querySelector?.('img,video,picture,[style*="background-image"]');
   const text=norm((cur.innerText||'').slice(0,2200));
   if(!media||text.length<2)continue;
   // Avoid swallowing a whole results grid: a card should normally own only a
   // small number of video destinations.
   const unique=new Set(links.map(a=>(a.getAttribute('href')||'').split('?')[0]));
   if(unique.size>3)continue;
   return cur;
 }
 return null;
}
function tiktokAuxCardFallback(source){
 // V1.1.15: discover non-standard TikTok cards (Shop/product/photo/slideshow/ad)
 // without treating those categories as AI evidence. Only the later evidence fusion
 // path can authorize HIDE.
 let cur=source;
 const hintSel='a[href*="/shop"],a[href*="/product"],a[href*="/view/product"],[data-e2e*="shop"],[data-e2e*="product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"],[data-e2e*="sponsor"],[data-e2e*="ad-"],[data-testid*="shop"],[data-testid*="product"],[data-testid*="photo"],[data-testid*="slide"],[data-testid*="carousel"],[data-testid*="sponsor"]';
 for(let i=0;i<9&&cur;i++,cur=cur.parentElement){
   if(cur.matches?.(PROTECTED)||!tiktokTargetSane(cur))continue;
   const hint=cur.matches?.(hintSel)||!!cur.querySelector?.(hintSel);
   if(!hint)continue;
   const r=cur.getBoundingClientRect();
   const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
   const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
   if(r.width<100||r.height<70||r.width>Math.min(980,vw*.78)||r.height>Math.min(920,vh*.94))continue;
   const media=[...cur.querySelectorAll?.('img,video,picture,[style*="background-image"]')||[]].filter(visibleBox);
   if(!media.length||media.length>10)continue;
   const text=norm((cur.innerText||cur.textContent||'').slice(0,2600));
   if(text.length>2600)continue;
   const links=[...cur.querySelectorAll?.('a[href]')||[]].filter(visibleBox);
   if(links.length>18)continue;
   return cur;
 }
 return null;
}

const TIKTOK_POST_OWNER_SELECTOR='article[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item"],[data-e2e="search-card-container"],[data-e2e="user-post-item"],article[role="article"]';
const TIKTOK_EVIDENCE_SELECTOR='[data-e2e="video-desc"],[data-e2e="browse-video-desc"],[data-e2e="aigc-tag"],[data-e2e*="aigc"],[data-e2e="video-author-uniqueid"],[data-e2e="browse-author-name"],[data-e2e="user-card-username"],a[href*="/tag/"]';
const tiktokEvidenceScopeCache=new WeakMap();
function tiktokEvidenceScopeSane(el){
 if(!el||!el.isConnected||el.matches?.(PROTECTED))return false;
 const r=el.getBoundingClientRect();
 const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
 const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
 if(r.width<100||r.height<70||r.width>vw*.96||r.height>Math.max(1300,vh*1.55))return false;
 const vids=[...el.querySelectorAll?.('a[href*="/video/"]')||[]];
 const unique=new Set(vids.map(a=>(a.getAttribute('href')||'').split('?')[0]).filter(Boolean));
 if(unique.size>3)return false;
 // The evidence scope may be larger than the hide target, but never an entire page/feed.
 if((r.width*r.height)>(vw*vh*.90)&&!el.matches?.(TIKTOK_POST_OWNER_SELECTOR))return false;
 return true;
}
function tiktokEvidenceScopeScore(el){
 if(!el||!tiktokEvidenceScopeSane(el))return -1;
 const hasEvidence=!!el.querySelector?.(TIKTOK_EVIDENCE_SELECTOR);
 const hasDesc=!!el.querySelector?.('[data-e2e="video-desc"],[data-e2e="browse-video-desc"]');
 const hasAigc=!!el.querySelector?.('[data-e2e="aigc-tag"],[data-e2e*="aigc"]');
 const hasTags=!!el.querySelector?.('a[href*="/tag/"]');
 const hasCreator=!!el.querySelector?.('[data-e2e="video-author-uniqueid"],[data-e2e="browse-author-name"],[data-e2e="user-card-username"],a[href*="/@"]');
 return (el.matches?.(TIKTOK_POST_OWNER_SELECTOR)?5:0)+(hasEvidence?3:0)+(hasDesc?3:0)+(hasAigc?5:0)+(hasTags?2:0)+(hasCreator?1:0);
}
function tiktokEvidenceScope(card){
 if(!card||!card.isConnected)return card;
 const cached=tiktokEvidenceScopeCache.get(card);
 if(cached?.isConnected&&cached!==card&&cached.contains?.(card))return cached;
 let best=card,bestScore=tiktokEvidenceScopeScore(card);
 const canonical=card.closest?.(TIKTOK_POST_OWNER_SELECTOR);
 if(canonical){const score=tiktokEvidenceScopeScore(canonical);if(score>bestScore){best=canonical;bestScore=score;}}
 let cur=card;
 for(let i=0;i<7&&cur;i++,cur=cur.parentElement){
   const score=tiktokEvidenceScopeScore(cur);if(score>bestScore){best=cur;bestScore=score;}
 }
 if(best!==card)tiktokEvidenceScopeCache.set(card,best);
 return best;
}
function tiktokSurfaceContext(card){
 if(!card)return '';
 const bits=[];
 for(const el of [card,...card.querySelectorAll?.('[data-e2e],[data-testid],a[href]')||[]]){
   for(const a of ['data-e2e','data-testid']){const v=el.getAttribute?.(a);if(v)bits.push(v)}
   if(el.matches?.('a[href]')){const h=el.getAttribute('href')||'';if(/\/(?:shop|product|view\/product)(?:\/|\?|$)/i.test(h))bits.push('shop product')}
   if(bits.join(' ').length>1800)break;
 }
 return norm(bits.join(' ').slice(0,1800));
}
function tiktokPolicyCues(text='',structural=''){
 const t=normalizeEvasionText(text),ctx=norm(structural);
 const humanMade=/\b(?:no[- ]ai|no ai used|not ai[- ]generated|not generated (?:by|with|using) ai|100% human(?:[- ]made)?|human[- ]made|hand[- ]drawn|hand drawn|drawn by hand|frame[- ]by[- ]frame|traditional animation|stop[- ]motion|original photography|photographed by|shot on (?:film|camera)|painted by hand|traditional art)\b/.test(t);
 const tool=/\b(?:heygen|synthesia|dreamina(?: ai)?|recraft(?: ai)?|krea(?: ai)?|hedra(?: ai)?|viggle(?: ai)?|seedance(?: ai)?|grok imagine|nano banana)\b/.test(t);
 const creation=/\b(?:generator|generate|generated|create|creator|make|made|text[- ]to[- ]image|text[- ]to[- ]video|image[- ]to[- ]video|image|photo|portrait|video|animation|avatar|voice|lip[- ]sync|product photos?)\b/.test(t);
 const promotion=/\b(?:try|use|free|online|app|tool|template|download|shop|buy|sale|sponsored|ad)\b/.test(t);
 const weakSurface=/\b(?:shop|product|photo|slide|slideshow|carousel|sponsor|ad)\b/.test(ctx);
 return {humanMade,toolCreation:tool&&creation,toolPromotion:tool&&creation&&promotion,weakSurface};
}
// V1.1.24 shared social hashtag evidence organ. Hashtag positives remain one
// provenance family so duplicates/case variants/tag stuffing cannot manufacture independence.
function socialHashtagCues(envelope={}){
 const H=globalThis.HattonHashtagOrganV1;
 if(H)return H.analyze({text:`${envelope.hashtags||''} ${envelope.visible||''} ${envelope.accessibility||''}`,hrefs:envelope.destination||''});
 return {tags:[],protective:false,explicitGeneration:false,mediaIdentity:false,persona:false,tool:false,promo:false,generic:false,compoundStrong:false,anyPositive:false,counts:{}};
}
// V1.1.25 shared non-hashtag phrase/metadata evidence organ. It deliberately
// strips hashtag tokens internally so one card cannot score the same token through
// both the hashtag and phrase provenance families.
function socialPhraseCues(envelope={}){
 const P=globalThis.HattonSocialPhraseOrganV1;
 if(P)return P.analyze({visible:envelope.visible||'',accessibility:envelope.accessibility||'',metadata:envelope.metadata||'',creator:envelope.creator||''});
 return {protective:false,explicitGeneration:false,mediaIdentity:false,persona:false,tool:false,generic:false,toolCreation:false,toolPromotion:false,promo:false,creatorSignal:false,metadataSignal:false,compoundStrong:false,anyPositive:false,counts:{},hits:{}};
}
function youtubeVideoCardFallback(source){
 // V1.1.12: YouTube search/recommendation renderers increasingly split the
 // thumbnail, title and channel metadata across sibling branches. Resolve from a
 // local /watch or /shorts anchor and walk only to the smallest sane owner.
 let anchor=source?.matches?.('a[href*="/watch"],a[href*="/shorts/"]')?source:source?.closest?.('a[href*="/watch"],a[href*="/shorts/"]')||source?.querySelector?.('a[href*="/watch"],a[href*="/shorts/"]');
 let cur=anchor||source;
 for(let i=0;i<10&&cur;i++,cur=cur.parentElement){
   if(cur.matches?.(PROTECTED)||!saneTarget(cur))continue;
   const links=[...cur.querySelectorAll?.('a[href*="/watch"],a[href*="/shorts/"]')||[]];
   if(!links.length)continue;
   const unique=new Set(links.map(a=>(a.getAttribute('href')||'').split('&')[0]));
   if(unique.size>4)continue;
   const r=cur.getBoundingClientRect();
   const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
   const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
   if(r.width<112||r.height<56||r.width>Math.min(1500,vw*.96)||r.height>Math.min(760,vh*.90))continue;
   const semantic=cur.querySelector?.('#video-title,[id="video-title"],h3,[role="heading"],ytd-channel-name,#channel-name,[aria-label],img[alt]');
   const text=norm(`${cur.innerText||''} ${cur.textContent||''}`.slice(0,3000));
   if(!semantic&&text.length<8)continue;
   return cur;
 }
 return null;
}
function socialCardCandidate(source){
 const p=socialPlatform(); if(!p||!source)return null;
 const selectors=socialCardSelector(p);
 const card=selectors&&(source.matches?.(selectors)?source:source.closest?.(selectors));
 if(card&&saneTarget(card))return card;
 if(p==='youtube')return youtubeVideoCardFallback(source);
 if(p==='tiktok'){
   const direct=tiktokVideoCardFallback(source)||tiktokAuxCardFallback(source);if(direct)return direct;
   // Captions, AIGC labels and hashtag anchors can live beside the smaller media
   // subtree. Resolve back through the enclosing post, then choose the same bounded
   // media/card target used by the existing hide path.
   const owner=source.closest?.(TIKTOK_POST_OWNER_SELECTOR);
   if(owner){
     const video=owner.querySelector?.('a[href*="/video/"]');
     const aux=owner.querySelector?.('a[href*="/shop"],a[href*="/product"],a[href*="/view/product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"]');
     const recovered=(video&&tiktokVideoCardFallback(video))||(aux&&tiktokAuxCardFallback(aux));
     if(recovered)return recovered;
   }
   return null;
 }
 return null;
}
// V1.1.9 canonical evidence envelope. Platform adapters may expose the same
// human-visible evidence through different DOM branches; collect those branches into
// one bounded, local envelope before classification. The envelope has no hide authority.
function socialCardEvidence(card){
 const p=socialPlatform(); if(!card)return {text:'',hrefs:'',platform:p,envelope:{}};
 const scope=p==='tiktok'?tiktokEvidenceScope(card):card;
 const buckets={visible:[],accessibility:[],metadata:[],creator:[],hashtags:[],destination:[]};
 const add=(bucket,v,limit=1200)=>{v=norm(v);if(v&&v.length<limit)buckets[bucket].push(v)};
 add('visible',(scope.innerText||'').slice(0,3600),4000);
 // V1.1.11: some YouTube/TikTok renderers expose card semantics in bounded
 // descendant text nodes/attributes that do not reliably contribute to innerText
 // during hydration. textContent is used only inside the already-resolved card.
 add('visible',(scope.textContent||'').slice(0,3600),4000);
 if(p==='youtube'){
   // Recover semantics from known renderer descendants without widening beyond the resolved card.
   for(const el of scope.querySelectorAll?.('#video-title,[id="video-title"],h3,[role="heading"],ytd-channel-name,#channel-name,#metadata-line,#description-text,yt-formatted-string')||[]){
     add('visible',(el.innerText||el.textContent||'').slice(0,1000),1200);
     add('accessibility',el.getAttribute?.('aria-label')); add('accessibility',el.getAttribute?.('title'));
   }
 }
 if(p==='tiktok'){
   // V1.1.15: non-video TikTok surfaces often keep product/photo/ad semantics in
   // descendants that are absent from card.innerText during hydration. Stay inside
   // the already-resolved bounded card and collect text/attributes only.
   const auxSel='[data-e2e*="shop"],[data-e2e*="product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"],[data-e2e*="sponsor"],[data-e2e*="ad-"],[data-testid*="shop"],[data-testid*="product"],[data-testid*="photo"],[data-testid*="slide"],[data-testid*="carousel"],[data-testid*="sponsor"],[data-product-title],[data-product-name],[data-ad-title],[data-advertiser]';
   let seen=0;
   for(const el of scope.querySelectorAll?.(auxSel)||[]){
     if(++seen>90)break;
     add('visible',(el.innerText||el.textContent||'').slice(0,1000),1200);
     for(const a of ['aria-label','title','alt','data-product-title','data-product-name','data-ad-title','data-advertiser','data-ai-label','data-content-label','data-generated-by','data-generator'])add('metadata',el.getAttribute?.(a));
   }
   // Current TikTok web surfaces expose captions and creator AI labels through
   // dedicated data-e2e nodes. Read these explicitly from the bounded post scope so
   // a smaller media hide-target cannot lose sibling caption/hashtag evidence.
   let evidenceSeen=0;
   for(const el of scope.querySelectorAll?.(TIKTOK_EVIDENCE_SELECTOR)||[]){
     if(++evidenceSeen>72)break;
     add('visible',(el.innerText||el.textContent||'').slice(0,1200),1400);
     for(const a of ['aria-label','aria-description','title','data-e2e','data-testid','data-ai-label','data-content-label','data-generated-by','data-generator'])add('metadata',el.getAttribute?.(a));
     if(el.matches?.('[data-e2e="video-author-uniqueid"],[data-e2e="browse-author-name"],[data-e2e="user-card-username"]'))add('creator',(el.textContent||'').slice(0,500),600);
   }
   if(scope.querySelector?.('[data-e2e="aigc-tag"],[data-e2e*="aigc"]'))add('metadata','creator labeled as ai generated',200);
 }
 const nodes=scope.querySelectorAll?.('[aria-label],[aria-description],[title],[alt],[data-e2e],[data-testid],[data-title],[data-caption],[data-author],[data-creator],[data-username],[data-nickname],[data-desc],[data-description],[data-product-title],[data-product-name],[data-ad-title],[data-advertiser],[data-ai-label],[data-content-label],[data-generated-by],[data-generator],#video-title,#channel-name,ytd-channel-name,yt-formatted-string,a[href*="/watch"],a[href*="/shorts/"],a[href*="/@"],a[href*="/channel/"],a[href*="/shop"],a[href*="/product"],a[href*="/view/product"]')||[];
 let metaSeen=0;
 for(const el of nodes){
   if(++metaSeen>120)break;
   add('accessibility',(el.textContent||'').slice(0,900),1000);
   for(const a of ['aria-label','aria-description','title','alt'])add('accessibility',el.getAttribute?.(a));
   for(const a of ['data-e2e','data-testid','data-title','data-caption','data-desc','data-description','data-product-title','data-product-name','data-ad-title','data-advertiser','data-ai-label','data-content-label','data-generated-by','data-generator'])add('metadata',el.getAttribute?.(a));
   for(const a of ['data-author','data-creator','data-username','data-nickname'])add('creator',el.getAttribute?.(a));
 }
 let linkSeen=0;
 for(const a of scope.querySelectorAll?.('a[href]')||[]){
   if(++linkSeen>120)break;
   const href=a.getAttribute('href')||''; add('destination',href,1600);
   if(p==='tiktok'&&/(?:\/@|\/user\/)/i.test(href)) add('creator',href,900);
   if(p==='tiktok'){
     const tm=href.match(/\/tag\/([a-z0-9_]{2,64})(?:[/?#]|$)/i);
     if(tm)add('hashtags',`#${tm[1]}`,80);
   }
   add('accessibility',a.getAttribute?.('aria-label'));
 }
 const raw=[...buckets.visible,...buckets.accessibility,...buckets.metadata,...buckets.creator].join(' ');
 const HH=globalThis.HattonHashtagOrganV1;
 if(HH){for(const tag of HH.extract({text:raw,hrefs:buckets.destination.join(' ')}))add('hashtags',`#${tag}`,80);}
 else for(const m of raw.matchAll(/#[a-z0-9_]{2,64}/gi))add('hashtags',m[0],80);
 const envelope={};
 for(const [k,v] of Object.entries(buckets))envelope[k]=normalizeEvasionText([...new Set(v)].join(' ').slice(0,k==='destination'?2600:4200));
 const text=normalizeEvasionText([envelope.visible,envelope.accessibility,envelope.metadata,envelope.creator,envelope.hashtags].filter(Boolean).join(' ').slice(0,7600));
 return {text,hrefs:envelope.destination,platform:p,envelope};
}
const ZERO_AI_SOCIAL_TERMS=[
 'artificial intelligence','generative ai','gen ai','ai generated','ai-generated','made with ai','created with ai','generated with ai','synthetic media','altered or synthetic content','altered with ai','ai info',
 'chatgpt','openai','dall-e','dall e','midjourney','stable diffusion','stability ai','adobe firefly','leonardo ai','ideogram','runway ai','runwayml','pika ai','suno ai','udio ai','elevenlabs',
 'sora ai','sora 2','veo 2','veo 3','veo 4','google veo','dream screen','dreamscreen','kling ai','hailuo ai','pixverse ai','luma dream machine','flux ai','flux.1','seedance','dreamina','higgsfield','grok imagine','nano banana','ai influencer','ai avatar','ai voice','voice clone','deepfake','deep fake',
 'large language model','llm','foundation model','prompt engineering','ai agent','agentic ai','machine learning','deep learning'
];
function socialEvidenceDecision(card,s){
 if(!card||!socialEnabled(s)||s.categories?.aiContent===false)return null;
 const RC=globalThis.RotaryCoreV1;if(!RC)return null; const E=RC.evidence;
 const ev=socialCardEvidence(card),t=ev.text;if(!t)return null; const a=[];
 const primaryBounded=normalizeEvasionText(`${ev.envelope?.visible||''} ${ev.envelope?.accessibility||''} ${ev.envelope?.hashtags||''}`);
 const label=/\b(made with ai|imagined with ai|ai[- ]generated|creator labeled as ai[- ]generated|altered or synthetic content|made using ai|generated with ai|synthetic media|ai info)\b/.test(t);
 if(label)a.push(E('metadata',`${ev.platform}-ai-disclosure`,7,`${ev.platform} visible AI/synthetic disclosure`));
 const generated=/\b(ai[- ]generated|generated (?:by|with|using) ai|created (?:by|with|using) ai|ai video|ai animation|ai music|ai song|ai voice|ai film|ai filmmaking|ai story|ai stories|synthetic video|deepfake|deep fake)\b/.test(t)||/\b((?:made|edited|remade) (?:with|using) ai|ai (?:image|photo|art|edit|filter|clone|avatar)|synthetic (?:media|voice))\b/.test(t);
 if(generated)a.push(E('text',`${ev.platform}-explicit-generated`,5,'Explicit AI-generated/synthetic media wording'));
 const generator=/\b(ai (?:image|video|music|voice|art|animation) generator|text[- ]to[- ](?:image|video|music)|image[- ]to[- ]video)\b/.test(t);
 if(generator)a.push(E('intent',`${ev.platform}-generator`,5,'Explicit AI generation workflow/service'));
 // V1.1.4 survivor pass: once a bounded social card exists, let strong card-level
 // AI context reach the existing decision engine. This does NOT broaden generic
 // page scanning and therefore cannot turn an unrelated page-level "Ai" token
 // (for example a translation/interjection) into evidence.
 const boundedAiContext=/\b(?:this is ai|is this ai|tell (?:if|whether|that) (?:this|it) is ai|ai videos?|ai photos?|ai images?|ai animation|ai generated|ai-generated|ai ad|ai content|ai model|ai models|ai tools?|ai agent|ai agents)\b/.test(t);
 if(ev.platform==='tiktok'&&boundedAiContext)a.push(E('context','tiktok-bounded-ai-context',4,'Bounded TikTok card has explicit AI context'));
 const hc=socialHashtagCues(ev.envelope||{});
 const hg=`${ev.platform}-hashtag-evidence`;
 const weakProtected=hc.protective&&!label&&!generated&&!generator;
 if(hc.explicitGeneration)a.push(E('metadata',`${ev.platform}-explicit-generation-hashtag`,5,`${ev.platform} explicit AI-generation hashtag`,1,hg));
 else if(hc.tool)a.push(E('metadata',`${ev.platform}-ai-tool-hashtag`,4,`${ev.platform} AI generation-tool hashtag`,1,hg));
 else if(hc.compoundStrong)a.push(E('metadata',`${ev.platform}-compound-ai-hashtags`,weakProtected?3:4,`${ev.platform} corroborated AI media/persona hashtag signature`,1,hg));
 else if(hc.mediaIdentity||hc.persona)a.push(E('metadata',`${ev.platform}-ai-media-persona-hashtag`,weakProtected?2:3,`${ev.platform} AI media/persona hashtag`,1,hg));
 else if(hc.promo)a.push(E('metadata',`${ev.platform}-ai-promo-hashtag`,weakProtected?1:2,`${ev.platform} AI promotional hashtag`,1,hg));
 else if(hc.generic&&!weakProtected)a.push(E('metadata',`${ev.platform}-generic-ai-hashtag`,1,`Generic ${ev.platform} AI topic hashtag`,1,hg));
 // V1.1.25: apply the same bounded semantic families to ordinary social text
 // and metadata without treating generic AI discussion as generated content.
 const pc=socialPhraseCues(ev.envelope||{});
 const pg=`${ev.platform}-phrase-evidence`;
 const phraseProtected=pc.protective&&!label&&!generated&&!generator&&!pc.explicitGeneration&&!pc.toolCreation&&!pc.toolPromotion;
 const phraseCanAdd=!label&&!generated&&!generator;
 if(phraseCanAdd&&pc.explicitGeneration)a.push(E('metadata',`${ev.platform}-explicit-generation-phrase`,5,`${ev.platform} explicit non-hashtag AI-generation wording`,1,pg));
 else if(phraseCanAdd&&pc.toolCreation)a.push(E('intent',`${ev.platform}-tool-creation-phrase`,4,`${ev.platform} generation tool paired with creation wording`,1,pg));
 else if(phraseCanAdd&&pc.toolPromotion)a.push(E('intent',`${ev.platform}-tool-promotion-phrase`,4,`${ev.platform} generation tool paired with promotional wording`,1,pg));
 else if(phraseCanAdd&&pc.compoundStrong)a.push(E('context',`${ev.platform}-compound-ai-phrases`,phraseProtected?3:4,`${ev.platform} corroborated AI media/persona/tool phrase signature`,1,pg));
 else if(phraseCanAdd&&(pc.mediaIdentity||pc.persona))a.push(E('context',`${ev.platform}-ai-media-persona-phrase`,phraseProtected?1:3,`${ev.platform} bounded AI media/persona wording`,1,pg));
 else if(phraseCanAdd&&pc.tool)a.push(E('context',`${ev.platform}-ai-tool-phrase`,phraseProtected?1:2,`${ev.platform} bounded generation-tool wording`,1,pg));
 else if(phraseCanAdd&&pc.promo&&!phraseProtected)a.push(E('context',`${ev.platform}-ai-promo-phrase`,2,`${ev.platform} bounded AI promotional wording`,1,pg));
 if(phraseProtected&&(pc.anyPositive||hc.anyPositive))a.push(E('integrity',`${ev.platform}-human-phrase-protection`,4,'Explicit human-made/no-AI wording protects against weak phrase/hashtag evidence',-1,pg));
 if(ev.platform==='tiktok'){
   const tc=tiktokPolicyCues(t,tiktokSurfaceContext(card));
   // Human-made/process wording protects ordinary art/photo/animation against weak
   // hashtag/topic evidence. It never overrides explicit generated/generator wording.
   if(tc.humanMade&&!label&&!generated&&!generator)a.push(E('integrity','tiktok-human-made-process',4,'Explicit human-made/traditional process context',-1));
   if(hc.protective&&!label&&!generated&&!generator&&!tc.toolCreation&&!pc.protective)a.push(E('integrity','tiktok-human-hashtag-protection',4,'Protective human-made/no-AI hashtag context',-1));
   // Newly covered tool names contribute only when paired with creation/media wording.
   // Shop/photo/cartoon/animation/sponsored structure by itself contributes NOTHING.
   if(tc.toolCreation)a.push(E('intent','tiktok-corroborated-generation-tool',4,'Named generation tool corroborated by creation/media context'));
   const creatorMarker=/(?:^|[\s/@._-])(?:ai(?:film(?:ing|maker|making)?|story|stories|video|art|creator)|fruit[ ._-]*drama[ ._-]*ai|boqorka[ ._-]*ai)(?:$|[\s/@._-])/.test(t);
   const creatorCorroborator=label||generated||generator||boundedAiContext||hc.explicitGeneration||hc.mediaIdentity||hc.tool||tc.toolCreation;
   if(creatorMarker&&creatorCorroborator)a.push(E('source','tiktok-creator-ai-corroboration',2,'AI-marked creator/handle corroborated by independent card evidence'));
 }
 if(s.level==='zero-ai'){
   // Hashtags are classified above as their own bounded provenance family; remove
   // hashtag tokens so the same tag cannot be scored twice as generic topic text.
   const topicText=normalizeEvasionText(t.replace(/#[a-z0-9_]{2,64}/g,' '));
   // Preserve the established YouTube/TikTok Zero-AI topic behaviour. Newly added
   // social beta adapters are deliberately stricter: ordinary human discussion about
   // AI stays visible unless generation/disclosure/hashtag evidence above supports HIDE.
   if(ev.platform==='tiktok'||ev.platform==='youtube'){
     const hits=ZERO_AI_SOCIAL_TERMS.filter(x=>topicText.includes(x)).slice(0,3);
     if(hits.length)a.push(E('topic',`${ev.platform}-zero-ai-topic`,5,'Zero-AI explicit AI topic/service/model'));
     else if(/(?:^|[^a-z0-9])ai(?:[^a-z0-9]|$)/.test(topicText) && ev.platform==='tiktok')a.push(E('topic','tiktok-zero-ai-bounded-token',3,'Zero-AI bounded TikTok card contains standalone AI topic token'));
     else if(/(?:^|[^a-z0-9])ai(?:[^a-z0-9]|$)/.test(primaryBounded) && ev.platform==='youtube')a.push(E('topic','youtube-zero-ai-bounded-token',3,'Zero-AI bounded YouTube title/accessibility contains standalone AI topic token'));
     if(/\b(openai|midjourney|stability|runway|leonardo|ideogram|pika|suno|udio|elevenlabs)\b/.test(ev.hrefs))a.push(E('source',`${ev.platform}-ai-destination`,3,'Explicit AI-service destination'));
   }
 }
 if(!a.length)return null;
 const hideAt=s.level==='zero-ai'?2:3; const fused=RC.fuse(a,{hideAt,recheckAt:1});
 if(fused.state!=='HIDE')return null;
 const cat=(generator||pc.toolCreation||pc.toolPromotion)?'AI generator':(generated||label||pc.explicitGeneration)?'AI-generated media':'AI content';
 return {category:cat,reason:`${ev.platform} bounded evidence: ${fused.reasons.slice(0,3).join('; ')}`,rotaryDecision:fused};
}

function saneTarget(el){
 if(!el || el.matches(PROTECTED) || el.closest('.rotary-hidden-card') || el.querySelector?.('.rotary-shield-note')) return false;
 const r=el.getBoundingClientRect();
 if(r.width<8 || r.height<8) return false;
 const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
 const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
 if(r.width>vw*0.90 && r.height>vh*0.45) return false;
 if((r.width*r.height)>(vw*vh*0.42)) return false;
 return true;
}
function isGoogleSearch(){
 return /(^|\.)google\.[a-z.]+$/i.test(location.hostname) && location.pathname==='/search';
}
function googleSurface(){
 if(!isGoogleSearch()) return 'none';
 const q=new URLSearchParams(location.search);
 const udm=q.get('udm')||'';
 const tbm=q.get('tbm')||'';
 if(tbm==='isch'||udm==='2') return 'images';
 if(tbm==='vid'||udm==='7') return 'videos';
 if(tbm==='nws'||udm==='12') return 'news';
 // Google has changed short-video/news routing repeatedly; DOM resolver below is the authority.
 return 'search';
}
function googleSpecialSection(source){
 // Keep special Google surfaces bounded: never return the page/column shell.
 let cur=source;
 for(let i=0;i<5 && cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const t=norm((cur.innerText||'').slice(0,1200));
   if(/\bai overview\b/.test(t)) return 'ai-overview';
   if(/\bpeople also ask\b/.test(t)) return 'paa';
 }
 return '';
}
function boundedResultAncestor(source,{needHeading=false,maxH=680,maxW=980}={}){
 let cur=source;
 for(let i=0;i<7 && cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   if(r.width<120||r.height<38||r.width>maxW||r.height>maxH) continue;
   const links=[...cur.querySelectorAll('a[href]')].filter(a=>{const x=a.getBoundingClientRect();return x.width>0&&x.height>0});
   const heading=cur.querySelector('h3,[role="heading"]');
   const text=norm(cur.innerText||'');
   if(!links.length||text.length<12||text.length>2400) continue;
   if(needHeading&&!heading) continue;
   return cur;
 }
 return null;
}
function visibleBox(el){
 if(!el)return false;
 const r=el.getBoundingClientRect();
 const cs=getComputedStyle(el);
 return r.width>1&&r.height>1&&cs.display!=='none'&&cs.visibility!=='hidden';
}
function googleImageCard(source){
 if(googleSurface()!=='images') return null;
 // Resolve one visual-result tile, not a grid/column. Prefer the smallest bounded
 // ancestor that contains media + a destination link + result metadata.
 let best=null,cur=source;
 for(let i=0;i<8&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   if(r.width<105||r.height<65||r.width>460||r.height>620) continue;
   const media=[...cur.querySelectorAll('img,picture,video')].filter(visibleBox);
   // Google Images frequently keeps the destination anchor/caption overlay dormant
   // until pointer interaction. Link visibility is therefore not a card-identity signal.
   // Requiring a visible anchor caused otherwise valid tiles to be discovered only on hover.
   const links=[...cur.querySelectorAll('a[href]')].filter(a=>!!a.getAttribute('href'));
   const text=norm(cur.textContent||'');
   if(!media.length||!links.length||text.length>1800) continue;
   // Avoid swallowing neighbouring masonry tiles. One card normally has only a
   // small number of visible media nodes and one principal result destination.
   if(media.length>4||links.length>8) continue;
   best=cur;
   // Prefer a text-bearing tile. Google Images frequently keeps the caption/source
   // one wrapper above the image/ARIA node; stopping at metadata-only wrappers caused
   // explicit AI captions to survive the live Zero-AI corpus.
   if(text.length>=8) break;
 }
 return best;
}
function googleImageCardEvidence(card){
 if(!card)return {text:'',title:'',source:'',media:'',hrefs:''};
 const titleBits=[],sourceBits=[],mediaBits=[],hrefBits=[];
 // Google Images can keep caption/source nodes in the tile DOM while they are
 // visually dormant until hover. Read bounded card-local textContent so the same
 // evidence is available before pointer interaction. This is DOM evidence only;
 // Hatton Shield still never infers AI from visual appearance.
 for(const el of card.querySelectorAll('h3,[role="heading"],a[href],span,[aria-label],[title],[data-title],[data-name],[data-source],[data-domain],[data-url]')){
   const t=norm(el.textContent||''); if(!t||t.length>320)continue;
   if(el.matches('h3,[role="heading"]')||el.closest?.('h3,[role="heading"]')) titleBits.push(t);
   else if(el.matches('a[href]')) titleBits.push(t);
   else sourceBits.push(t);
   if(titleBits.join(' ').length+sourceBits.join(' ').length>2200)break;
 }
 for(const el of card.querySelectorAll('img[alt],img[title],[aria-label],[title]')){
   for(const a of ['alt','aria-label','title']){const v=norm(el.getAttribute?.(a));if(v)mediaBits.push(v)}
   if(mediaBits.join(' ').length>1000)break;
 }
 // Google often keeps useful result evidence outside visible text (ARIA/data attributes
 // and redirect/query parameters). Read only local DOM metadata; Rotary never fetches it.
 for(const el of card.querySelectorAll('[data-title],[data-name],[data-source],[data-domain],[data-url],a[aria-label]')){
   for(const a of ['data-title','data-name','data-source','data-domain','data-url','aria-label']){
     const v=norm(el.getAttribute?.(a)); if(v) mediaBits.push(v);
   }
   if(mediaBits.join(' ').length>1500)break;
 }
 for(const a of card.querySelectorAll('a[href]')){
   try{
     const u=new URL(a.href,location.href); hrefBits.push(`${u.hostname} ${u.pathname}`);
     // Decode only a small allow-list of common Google redirect/result parameters.
     for(const k of ['q','url','imgurl','imgrefurl']){
       const v=u.searchParams.get(k); if(v) hrefBits.push(norm(decodeURIComponent(v)).slice(0,360));
     }
   }catch{}
   if(hrefBits.join(' ').length>1400)break;
 }
 const title=norm([...new Set(titleBits)].join(' ').slice(0,1200));
 const source=norm([...new Set(sourceBits)].join(' ').slice(0,1200));
 const media=norm([...new Set(mediaBits)].join(' ').slice(0,1000));
 const hrefs=norm([...new Set(hrefBits)].join(' ').slice(0,1400));
 return {title,source,media,hrefs,text:normalizeEvasionText(`${title} ${source} ${media} ${hrefs}`.slice(0,4400))};
}

function googleDeepEvidence(card){
 if(!card)return {title:'',source:'',media:'',hrefs:'',deep:'',text:''};
 // V2.1 deep extractor: bounded, local-DOM only. It never fetches destinations and
 // never infers AI from visual appearance. It expands evidence only from the card.
 const textBits=[],metaBits=[],hrefBits=[],mediaBits=[];
 const nodes=[card,...card.querySelectorAll('*')];
 let seen=0;
 for(const el of nodes){
   if(++seen>180)break;
   // Deep evidence is deliberately geometry-independent on a bounded card.
   // Using textContent exposes dormant local captions before hover and avoids the
   // forced-layout cost of repeatedly reading innerText during image-grid scrolling.
   const t=norm(el.textContent||'');
   if(t&&t.length<=420)textBits.push(t);
   for(const a of ['aria-label','title','alt','data-title','data-name','data-source','data-domain','data-url','data-context','data-caption','data-tooltip','data-query','itemprop','content']){
     const v=norm(el.getAttribute?.(a)); if(v&&v.length<=520)metaBits.push(v);
   }
   if(el.matches?.('img,video,source')){
     for(const a of ['src','poster']){
       const v=el.getAttribute?.(a); if(!v)continue;
       try{const u=new URL(v,location.href);mediaBits.push(`${u.hostname} ${u.pathname}`)}catch{}
     }
   }
   if(el.matches?.('a[href]')){
     try{
       const u=new URL(el.href,location.href); hrefBits.push(`${u.hostname} ${u.pathname}`);
       for(const k of ['q','url','imgurl','imgrefurl','ved','source']){
         const v=u.searchParams.get(k); if(v&&k!=='ved')hrefBits.push(norm(decodeURIComponent(v)).slice(0,520));
       }
     }catch{}
   }
   if(textBits.join(' ').length>3000&&metaBits.join(' ').length>2600&&hrefBits.join(' ').length>2200)break;
 }
 const uniq=a=>norm([...new Set(a)].join(' '));
 const deep=norm(`${uniq(textBits).slice(0,3000)} ${uniq(metaBits).slice(0,2600)} ${uniq(mediaBits).slice(0,1400)}`.slice(0,6500));
 const hrefs=uniq(hrefBits).slice(0,2400);
 return {title:'',source:uniq(metaBits).slice(0,1800),media:uniq(mediaBits).slice(0,1400),hrefs,deep,text:norm(`${deep} ${hrefs}`.slice(0,7600))};
}
function mergeGoogleEvidence(a,b){
 const join=(x,y,n)=>norm(`${x||''} ${y||''}`.slice(0,n));
 return {title:join(a?.title,b?.title,1600),source:join(a?.source,b?.source,2200),media:join(a?.media,b?.media,1800),hrefs:join(a?.hrefs,b?.hrefs,2600),deep:join(a?.deep,b?.deep,4200),text:join(a?.text,b?.text,7600)};
}
function explicitAISurvivorCue(text=''){
 text=norm(text);
 return /\b(?:ai|artificial intelligence|generative ai|synthetic)\b.{0,70}\b(?:image|photo|art|illustration|portrait|animation|video|audio|music|song|voice|content|generator|generated|creator|maker|stock)\b|\b(?:image|photo|art|illustration|portrait|animation|video|audio|music|song|voice|content|stock)\b.{0,70}\b(?:ai|artificial intelligence|generative ai|synthetic)\b/.test(text);
}
function shouldDeepEscalate(card,s,ev,guardResult,fused){
 if(!['maximum','extreme','zero-ai'].includes(s?.level))return false;
 if(deepPassedCards.has(card))return false;
 if(fused?.state==='HIDE')return false;
 const action=guardResult?.action||'';
 const uncertain=['WATCH','CONFLICT','INSUFFICIENT','PASS'].includes(action)||fused?.state==='RECHECK'||fused?.state==='ALLOW';
 return uncertain&&explicitAISurvivorCue(`${ev?.text||''} ${googleCardText(card)}`);
}

function googleResultEvidence(card){
 if(!card)return {text:'',title:'',source:'',media:'',hrefs:'',deep:''};
 const titleBits=[],sourceBits=[],mediaBits=[],hrefBits=[];
 const push=(arr,v,max=320)=>{v=norm(v||'');if(v&&v.length<=max&&!arr.includes(v))arr.push(v);};
 push(sourceBits,card.innerText||'',1800);
 for(const el of card.querySelectorAll('h3,[role="heading"],a[href],span,[aria-label],[aria-description],[title],img[alt],video')){
   if(!visibleBox(el))continue;
   const t=norm(el.innerText||'');
   if(el.matches('h3,[role="heading"]')||el.closest?.('h3,[role="heading"]'))push(titleBits,t,420);
   else if(el.matches('a[href]'))push(sourceBits,t,420);
   for(const a of ['aria-label','title','alt'])push(mediaBits,el.getAttribute?.(a),420);
   if(el.matches('a[href]')){const h=el.getAttribute('href')||'';push(hrefBits,h,900);try{const u=new URL(h,location.href);push(hrefBits,`${u.hostname} ${u.pathname} ${u.search}`,900);}catch{}}
 }
 const title=norm(titleBits.join(' ').slice(0,1600));
 const source=norm(sourceBits.join(' ').slice(0,3000));
 const media=norm(mediaBits.join(' ').slice(0,2100));
 const hrefs=norm(hrefBits.join(' ').slice(0,3200));
 return {title,source,media,hrefs,deep:'',text:norm(`${title} ${source} ${media} ${hrefs}`.slice(0,7600))};
}
function googleNewsCard(source){
 if(googleSurface()!=='news')return null;
 let cur=source;
 for(let i=0;i<7&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur))break;
   const r=cur.getBoundingClientRect(), text=norm(cur.innerText||'');
   const heading=cur.querySelector('h3,[role="heading"]');
   const links=[...cur.querySelectorAll('a[href]')].filter(visibleBox);
   if(r.width<180||r.height<55||r.width>980||r.height>620||text.length<12||text.length>2400)continue;
   if(links.length&&(heading||cur.querySelector('img')))return cur;
 }
 return null;
}
function googleVideoCard(source){
 if(googleSurface()!=='videos' && googleSpecialSection(source)!=='') return null;
 let cur=source;
 for(let i=0;i<6&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   const text=norm(cur.innerText||'');
   if(r.width<180||r.height<70||r.width>900||r.height>520||text.length>2000) continue;
   if(cur.querySelector('a[href]')&&(cur.querySelector('video,img')||cur.querySelector('h3,[role="heading"]'))) return cur;
 }
 return null;
}
function googlePaaItem(source){
 if(googleSpecialSection(source)!=='paa') return null;
 let cur=source;
 for(let i=0;i<4&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   const t=norm(cur.innerText||'');
   if(r.width>=180&&r.height>=32&&r.height<=220&&t.length>=10&&t.length<=700 && (cur.matches('[role="button"]')||cur.querySelector('[role="button"],button'))) return cur;
 }
 return null;
}
function googleOverviewGeneratorUnit(source){
 if(googleSpecialSection(source)!=='ai-overview') return null;
 // Live-corpus V1.4.1: an explicit generator-list heading is stronger than a generic
 // AI Overview link. Select only the bounded recommendation unit beneath/around it.
 let root=source.closest?.('div,section,article,li')||source;
 for(let cur=root,depth=0;cur&&depth<7;cur=cur.parentElement,depth++){
   if(cur.matches?.(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect(); const t=norm(cur.innerText||'');
   if(!/\b(top|best|recommended|popular)?\s*(ai|artificial intelligence)\s+(image|art|photo|video)\s+generators?\b/.test(t)) continue;
   const links=[...cur.querySelectorAll('a[href]')].filter(visibleBox);
   const listish=cur.querySelectorAll('li').length>=2||links.length>=2;
   if(listish&&links.length<=12&&r.width>=220&&r.height>=90&&r.width<=820&&r.height<=520&&t.length<=1800)return cur;
 }
 return null;
}
function googleOverviewItem(source){
 if(googleSpecialSection(source)!=='ai-overview') return null;
 // Never hide the AI Overview prose/container itself. V1.1 requires a real bounded
 // recommendation card, not merely any ancestor that happens to contain a link.
 let cur=source;
 for(let i=0;i<5&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   const t=norm(cur.innerText||'');
   const links=[...cur.querySelectorAll('a[href]')].filter(visibleBox);
   const media=[...cur.querySelectorAll('img,picture,video')].filter(visibleBox);
   const heading=cur.querySelector('h3,[role="heading"]');
   const cardish=cur.matches('article,[role="article"],li,figure')||!!heading||media.length>0;
   if(cardish&&links.length&&links.length<=6&&r.width>=160&&r.height>=54&&r.width<=760&&r.height<=320&&t.length>=12&&t.length<=900) return cur;
 }
 return null;
}
function googleOrganicCard(source){
 if(!isGoogleSearch()) return null;
 let cur=source;
 for(let i=0;i<7&&cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED)||!saneTarget(cur)) break;
   const r=cur.getBoundingClientRect();
   const text=norm(cur.innerText||'');
   const h=cur.querySelector('h3,[role="heading"]');
   const link=h?.closest('a[href]')||h?.querySelector('a[href]')||cur.querySelector('a[href] h3')?.closest('a[href]');
   if(h&&link&&text.length>=12&&text.length<=2200&&r.width>=180&&r.height>=45&&r.width<=980&&r.height<=620) return cur;
 }
 return null;
}
function googleCardCandidate(source){
 if(!isGoogleSearch()) return null;
 return googlePaaItem(source)||googleOverviewGeneratorUnit(source)||googleOverviewItem(source)||googleImageCard(source)||googleNewsCard(source)||googleVideoCard(source)||googleOrganicCard(source)||boundedResultAncestor(source,{needHeading:true});
}
function googleCardText(card){
 if(!card) return '';
 const bits=[card.innerText||''];
 for(const el of card.querySelectorAll('[aria-label],[aria-description],[title],img[alt]')){
   for(const a of ['aria-label','title','alt']){const v=el.getAttribute?.(a);if(v)bits.push(v);}
   if(bits.join(' ').length>3000) break;
 }
 return normalizeEvasionText(bits.join(' ').slice(0,3200));
}
function classifyCrossMediaContent(text='',hrefs='',surface=googleSurface()){
 text=norm(`${text} ${hrefs}`);
 const hasAI=/\b(ai|artificial intelligence|generative ai|synthetic)\b/.test(text);
 const creation=/\b(create|creating|generate|generating|make|making|text[- ]to[- ](?:image|video)|image[- ]to[- ]video|voice clon(?:e|ing))\b/.test(text);
 const media=/\b(images?|photos?|art|artwork|illustrations?|portraits?|videos?|animations?|audio|music|songs?|voices?|content)\b/.test(text);
 const stock=/\b(stock|royalty[- ]free|free download|download(?: free)?|collection)\b/.test(text);
 const generator=/\b(generator|maker|creator|studio|tool|create images online|generate images online)\b/.test(text);
 const tutorial=/\b(how to|tutorial|guide|workflow|tips?|trick|consistent|realistic)\b/.test(text);
 const editorial=/\b(news|report|research|study|policy|copyright|lawsuit|analysis|future of|year ahead|exclusive|interview)\b/.test(text);
 const educational=/\b(what is|what does|how does|explained|for dummies|understanding|how to spot|how to detect|detecting ai)\b/.test(text);
 if(editorial)return {name:'AI_REFERENCE_EDITORIAL',polarity:-1,weight:6,reason:'editorial/news/research AI reference'};
 if(educational&&!creation)return {name:'AI_RESEARCH_REFERENCE',polarity:-1,weight:6,reason:'educational/research AI reference'};
 if(hasAI&&surface==='videos'&&tutorial&&creation&&media)return {name:'AI_CREATOR_VIDEO',polarity:1,weight:7,reason:'AI creation tutorial/video'};
 if(hasAI&&tutorial&&creation&&media)return {name:'AI_CREATION_TUTORIAL',polarity:1,weight:6,reason:'AI creation tutorial'};
 if(hasAI&&generator&&media)return {name:'AI_GENERATOR_SERVICE',polarity:1,weight:7,reason:'AI generator/service'};
 if(hasAI&&stock&&media)return {name:'AI_MEDIA_LIBRARY',polarity:1,weight:6,reason:'explicit AI media library/stock collection'};
 if(/\b(ai[- ]generated|generated by ai|generated with ai|synthetic (?:media|image|photo|video|audio|voice|content))\b/.test(text))return {name:'AI_GENERATED_MEDIA',polarity:1,weight:7,reason:'explicit AI-generated/synthetic media'};
 if(hasAI&&media&&/\b(sponsored|try|free|online|download|browse|collection)\b/.test(text))return {name:'AI_PROMOTION',polarity:1,weight:5,reason:'AI media promotion/action context'};
 return {name:'AI_UNKNOWN',polarity:0,weight:0,reason:'no decisive cross-media class'};
}
function crossMediaPolicyEvidence(cls,level,E){
 if(!cls||!E||cls.polarity===0)return [];
 const aggressive=['extreme','zero-ai'].includes(level);
 const maximum=level==='maximum';
 if(cls.polarity<0)return [E('intent',`cross-media:${cls.name}`,cls.weight,cls.reason,-1)];
 let w=cls.weight;
 if(!aggressive&&!maximum&&['AI_MEDIA_LIBRARY','AI_CREATION_TUTORIAL','AI_CREATOR_VIDEO'].includes(cls.name))w=Math.max(2,w-3);
 return [E('intent',`cross-media:${cls.name}`,w,cls.reason,1)];
}
function classifyGoogleSourceIntent(text,hrefs='',surface=googleSurface()){
 text=norm(text); hrefs=norm(hrefs);
 const classes=[];
 const add=(name,polarity,weight,reason)=>classes.push({name,polarity,weight,reason});
 const explicitGenerator=/\b(ai|artificial intelligence)\s+(image|art|photo|video)\s+(generators?|makers?|creators?|editors?|animators?)\b|\b(text[- ]to[- ]image|image[- ]to[- ]image|text[- ]to[- ]video)\b|\b(generate|create|make)\s+(your own\s+)?(ai|artificial intelligence)[ -]?(images?|art|photos?|videos?)\b/.test(text);
 const tutorial=/\b(how to|tutorial|guide|workflow)\b/.test(text);
 const question=/^(how|what|why|when|where|who|can|could|should|is|are|does|do|will|would)\b.{0,180}\?/.test(text)||/\bpeople also ask\b/.test(text);
 const educational=/\b(what is|what does|explained|for dummies|understanding|learn about|spot ai|detect ai)\b/.test(text);
 const generatorList=/\b(top|best|recommended|popular)?\s*(ai|artificial intelligence)\s+(image|art|photo|video)\s+generators?\b/.test(text);
 const editorial=/\b(news|report|research|study|explained|future of|year ahead|history of|exclusive|policy|copyright)\b/.test(text);
 const library=/\b(stock photos?|stock images?|royalty[- ]free|free download|download(?: free)?(?: high resolution)?|download.{0,35}(images?|photos?|illustrations?))\b/.test(text);
 const mediaReference=/\b(ai|artificial intelligence)\s+(animation|illustrations?|portraits?|images?|photos?)\b/.test(text);
 const destinationGenerator=/\b(generator|creator|maker|generate|text[-_ ]?to[-_ ]?image|image[-_ ]?generator)\b/.test(hrefs);
 if(generatorList)add('GENERATOR_LIST',1,7,'explicit generator recommendation list');
 if(explicitGenerator)add('GENERATOR_SERVICE',1,5,'explicit generator/service intent');
 if(destinationGenerator)add('GENERATOR_DESTINATION',1,2,'generation-oriented destination');
 if(question)add('QUESTION_REFERENCE',-1,6,'question/reference intent');
 if(educational)add('EDUCATIONAL_REFERENCE',-1,5,'educational/reference intent');
 if(tutorial)add('TUTORIAL_REFERENCE',-1,3,'tutorial/reference intent');
 if(editorial)add('EDITORIAL_REFERENCE',-1,5,'editorial/news/reference intent');
 if(library)add('MEDIA_LIBRARY',-1,4,'stock/download media-library intent');
 if(mediaReference&&!explicitGenerator&&!editorial&&!library)add('AMBIGUOUS_AI_MEDIA',1,2,'ambiguous AI-media reference');
 if(surface==='videos'&&(tutorial||editorial))add('VIDEO_REFERENCE',-1,2,'video news/tutorial context');
 return classes;
}
function googleIntentScore(text){
 let score=0; const reasons=[];
 const add=(n,label)=>{score+=n;reasons.push(label)};
 // Explicit product/tool intent: high precision and enough to trigger by itself.
 if(/\b(ai|artificial intelligence)\s+(image|art|photo|video)\s+generator\b/.test(text)) add(6,'generator product');
 if(/\b(text[- ]to[- ]image|image[- ]to[- ]image|text[- ]to[- ]video)\b/.test(text)) add(5,'generation modality');
 if(/\b(generate|create|make)\s+(your own\s+)?(ai|artificial intelligence)[ -]?(images?|art|photos?|videos?)\b/.test(text)) add(5,'creation intent');
 if(/\b(generate|create|make)\s+(visuals?|images?|art|photos?|videos?)\b.{0,70}\b(ai|chatgpt images|image generator|generative ai)\b/.test(text)) add(5,'visual creation intent');
 if(/\b(ai|generative ai)\s+(image|art|photo|video)\s+(tool|maker|creator|editor|animator)\b/.test(text)) add(4,'creation tool');
 if(/\bfree\s+(online\s+)?ai\s+(image|art|photo|video)\b/.test(text)) add(3,'free AI media tool');
 // Tutorials/workflows are filterable only when explicitly about producing AI media.
 if(/\b(how to|tutorial|workflow|guide to)\b.{0,70}\b(create|generate|make)\b.{0,70}\b(ai|artificial intelligence)\b.{0,40}\b(image|art|photo|video)/.test(text) ||
    /\b(create|generate|make)\b.{0,50}\b(ai|artificial intelligence)\b.{0,40}\b(image|art|photo|video).{0,70}\b(tutorial|workflow|guide)\b/.test(text)) add(4,'generation tutorial');
 // Commercial/action cues strengthen a genuine creation signal but cannot create one alone.
 if(score>0 && /\b(free|try|start|online|tool|generator|create|generate|download|use)\b/.test(text)) add(1,'action cue');
 // Discussion/news/research protection. It can offset weak evidence, never explicit product intent.
 const discussion=/\b(news|report|research|study|explained|what is|what does|detect|detection|ethics|policy|copyright|future of|year ahead|rise of|history of|review of|exclusive)\b/.test(text);
 if(discussion&&score<6){score-=3;reasons.push('discussion context');}
 return {score,reasons:[...new Set(reasons)]};
}
// Public build: persistent survivor reporting removed; decision logic below is unchanged.
function googleEvidenceDecision(card,s,deepPass=false,overrideEvidence=null){
 if(!isGoogleSearch()||!card||interactiveContext(card)) return null;
 const RC=globalThis.RotaryCoreV1;
 if(!RC) return null; // fail open if core did not initialise
 const surface=googleSurface();
 const ev=overrideEvidence||(surface==='images'?googleImageCardEvidence(card):googleResultEvidence(card));
 const text=ev?.text||googleCardText(card); if(!text) return null;
 // Explicit user rules remain independent of AI inference.
 if(!mutedProtected(card)) for(const w of s.mutedWords||[]){const x=norm(w);if(x&&text.includes(x))return {category:'Muted word',reason:`Matched "${x.slice(0,60)}"`,rotaryState:'USER_HIDE'};}
 // V2.3: Google Images often renders the human-visible caption in a span/div rather than a heading.
 // Keep the evidence bounded to the resolved card, but include source/caption text so explicit
 // AI stock/download/media wording cannot fall through merely because Google changed markup.
 const strong=surface==='images'?norm(`${ev.title||''} ${ev.source||''} ${ev.media||''}`):text;
 const supporting=`${ev.source||''} ${ev.media||''} ${ev.hrefs||''} ${ev.deep||''}`;
 let guardResult=null;
 const E=RC.evidence, organs={
   text:()=>{
     const a=[];
     if(/\b(ai|artificial intelligence)[ -]?(generated|created|made)\b|\b(generated|created|made|produced) (by|with|using) (ai|artificial intelligence)\b|\bai[- ]assisted\b/.test(strong))a.push(E('text','visible-title',6,'explicit generated/AI-assisted media wording'));
     if(/\b(ai|artificial intelligence)[ -]?(generated|created|made)?[ -]?(image|photo|art|illustration|video|animation|audio|music|song|voice|text)s?\b/.test(strong)&&!/\b(what is|what does|how to spot|how to detect|news|research|study|policy|copyright|future of|year ahead|understanding)\b/.test(strong))a.push(E('text','cross-media-ai-content',5,'explicit cross-media AI content wording'));
     if(/\b(ai|artificial intelligence)\s+(image|art|photo|video|animation|music|song|audio|voice|text)\s+(generator|maker|creator)\b|\b(text[- ]to[- ]image|text[- ]to[- ]video|image[- ]to[- ]video|text[- ]to[- ]speech|voice cloning)\b/.test(strong))a.push(E('text','cross-media-generator',6,'cross-media generator/service wording'));
     if(/\b(top|best|recommended|popular)?\s*(ai|artificial intelligence)\s+(image|art|photo|video)\s+generators?\b/.test(strong))a.push(E('text','generator-list-heading',7,'explicit generator recommendation list'));
     if(/\b(ai|artificial intelligence)\s+(image|art|photo|video)\s+(generators?|makers?|creators?|editors?|animators?)\b/.test(strong))a.push(E('text','visible-title',6,'explicit AI creation product'));
     if(/\b(text[- ]to[- ]image|image[- ]to[- ]image|text[- ]to[- ]video)\b/.test(strong))a.push(E('text','visible-title',6,'generation modality'));
     if(/\b(generate|create|make)\b.{0,45}\b(ai|artificial intelligence)\b.{0,35}\b(images?|art|photos?|videos?)\b/.test(strong))a.push(E('text','visible-title',5,'explicit creation intent'));
     if(/\b(generate|create|make)\s+(visuals?|images?|art|photos?|videos?)\b.{0,70}\b(ai|chatgpt images|image generator|generative ai)\b/.test(strong))a.push(E('text','visible-title',5,'explicit visual creation intent')); 
     if(/\b(ai|artificial intelligence)\s+(stock\s+)?(images?|photos?|art|artwork|animation|illustrations?|portraits?|selfies?)\b/.test(strong))a.push(E('text','visible-title',4,'AI-media title'));
     if(/\b(ai|artificial intelligence)\b.{0,34}\b(free|online)\b.{0,34}\b(advanced\s+)?(images?|photos?|art|videos?)\b/.test(strong)||/\b(free|online)\b.{0,34}\b(ai|artificial intelligence)\b.{0,34}\b(images?|photos?|art|videos?)\b/.test(strong))a.push(E('text','visible-title',4,'AI media-service title'));
     return a;
   },
   metadata:()=>{
     const a=[];
     if(/\b(ai|artificial intelligence)[-_ ]?(image|images|art|photo|photos|video|videos)\b/.test(supporting)&&/\b(generator|creator|maker|generate|generated|text[-_ ]?to[-_ ]?image|stock[-_ ]?(image|photo))\b/.test(supporting))a.push(E('metadata','hydrated-metadata',4,'hydrated AI-media product metadata'));
     if(/\b(generator|generative|generated|ai image|ai art|ai photo|ai video)\b/.test(supporting))a.push(E('metadata','hydrated-metadata',2,'supporting generation metadata'));
     return a;
   },
   distribution:()=>{
     const a=[];
     // V2.3 media-origin/distribution evidence. This is semantic/local metadata evidence,
     // never visual inference and never a remote reputation lookup.
     const bounded=norm(`${strong} ${supporting}`);
     const explicitAI=/\b(ai|artificial intelligence|generative ai|synthetic)\b/.test(bounded);
     const mediaKind=/\b(images?|photos?|art|artwork|illustrations?|portraits?|animations?|videos?|audio|voices?|content)\b/.test(bounded);
     const distribution=/\b(stock|royalty[- ]free|free download|download(?: free)?|download high resolution|collection|browse|licensable)\b/.test(bounded);
     const service=/\b(generator|creator|maker|studio|text[- ]to[- ]image|text[- ]to[- ]video|create images online|generate images online)\b/.test(bounded);
     if(explicitAI&&mediaKind&&distribution)a.push(E('distribution','ai-media-distribution',6,'explicit AI media distribution/library context'));
     if(explicitAI&&mediaKind&&service)a.push(E('distribution','ai-media-service',6,'explicit AI media creation service context'));
     if(explicitAI&&mediaKind&&/\b(stockcake|istock|dreamstime|vecteezy|magnific|lummi)\b/.test(bounded))a.push(E('distribution','media-origin-corroboration',3,'AI media wording corroborated by media-library origin'));
     return a;
   },
   intent:()=>{
     const a=[]; const g=googleIntentScore(text);
     const cross=classifyCrossMediaContent(text,ev?.hrefs||'',surface);
     // In Zero-AI, editorial/educational context is not negative evidence: the profile
     // explicitly excludes AI-focused discussion as well as generated media. Extreme
     // keeps the reference protection.
     if(!(s.level==='zero-ai'&&cross.polarity<0)) a.push(...crossMediaPolicyEvidence(cross,s.level||'extreme',E));
     if(s.level==='zero-ai'&&( /\b(ai|artificial intelligence|generative ai|synthetic media|large language models?|llms?|machine learning|deep learning|foundation models?|generative models?|prompt engineering|ai agents?|agentic ai)\b/.test(strong) || /\b(chatgpt|dall[ -]?e|midjourney|stable diffusion|stability ai|runwayml|leonardo ai|ideogram|pika|suno|udio|elevenlabs|openai|anthropic)\b/.test(strong) || /\b(midjourney\.com|openai\.com|chatgpt\.com|anthropic\.com|stability\.ai|runwayml\.com|leonardo\.ai|ideogram\.ai|pika\.art|suno\.com|udio\.com|elevenlabs\.io)\b/.test(ev?.hrefs||'') ))a.push(E('topic','zero-ai-explicit-topic',5,'Zero-AI explicit AI ecosystem/topic/service'));
     for(const c of classifyGoogleSourceIntent(text,ev?.hrefs||'',surface)){
       // V1.1.11: Zero-AI explicitly excludes AI-focused news/reference/tutorial
       // material, so editorial/reference classifications must not become negative
       // evidence that forces a high-scoring AI card into RECHECK. Extreme and
       // lower profiles retain the false-positive protection unchanged.
       if(s.level==='zero-ai'&&c.polarity<0&&/\b(ai|artificial intelligence|generative ai|synthetic media|chatgpt|openai|anthropic)\b/.test(strong))continue;
       let w=(c.name==='MEDIA_LIBRARY'&&['high','maximum','extreme','zero-ai'].includes(s.level))?Math.max(0,c.weight-({high:2,maximum:3,extreme:4,'zero-ai':5}[s.level]||0)):c.weight; if(['extreme','zero-ai'].includes(s.level)&&['TUTORIAL_REFERENCE','VIDEO_REFERENCE'].includes(c.name)&&['AI_CREATION_TUTORIAL','AI_CREATOR_VIDEO'].includes(cross.name))w=0; if(w>0)a.push(E('intent',`source-intent:${c.name}`,w,c.reason,c.polarity));}
     if(g.score>=6)a.push(E('intent','intent-model',5,g.reasons.join(', ')));
     else if(g.score>=4)a.push(E('intent','intent-model',4,g.reasons.join(', ')));
     if(s.level!=='zero-ai'&&/\b(news|report|research|study|explained|what is|what does|detect|detection|ethics|policy|copyright|for dummies|future of|year ahead|history of|exclusive|understanding)\b/.test(text))a.push(E('intent','discussion-context',5,'discussion/reference context',-1));
     if(googleSpecialSection(card)==='paa'&&/^(how|what|why|when|where|who|can|could|should|is|are|does|do|will|would)\b.{0,220}\?/.test(text))a.push(E('intent','paa-question-context',7,'PAA question is reference content, not promotion',-1));
     // Live-survivor rule: stock/download/portrait pages are media-library results, not generator promotions.
     if(/\b(stock photos?|stock images?|royalty[- ]free|download)\b/.test(text)&&!/\b(generator|generate|generated with ai|generated by ai|created with ai|text[- ]to[- ]image)\b/.test(text)){const mw=({high:2,maximum:1,extreme:0,'zero-ai':0})[s.level]??4;if(mw>0)a.push(E('intent','media-library-context',mw,'stock/download media context',-1));}
     return a;
   },
   structure:()=>['images','videos','news'].includes(surface)?[E('structure',`google-${surface}-surface`,1,`Google ${surface} result card`)]:[],
   source:()=>{
     // Destination metadata is normalized for every Google result surface. It can
     // corroborate semantic evidence but never hide on its own.
     const a=[];
     if(/\b(generator|creator|maker|generate|generated|text[-_ ]?to[-_ ]?image|text[-_ ]?to[-_ ]?video)\b/.test(ev.hrefs))a.push(E('source','destination-metadata',2,'generation-oriented destination metadata'));
     if(s.level==='zero-ai'&&/\b(openai\.com|chatgpt\.com|anthropic\.com|midjourney\.com|stability\.ai|runwayml\.com|leonardo\.ai|ideogram\.ai|pika\.art|suno\.com|udio\.com|elevenlabs\.io)\b/.test(ev.hrefs))a.push(E('source','zero-ai-destination',3,'Zero-AI explicit AI-service destination'));
     return a;
   },
   guardProtocol:()=>{
     const G=globalThis.RotaryGuardV2;if(!G)return [];
     const g=G.evaluate({text:strong,metadata:supporting,hrefs:ev?.hrefs||'',sensitivity:s.level||'extreme',actionable:!!card.querySelector?.('a[href],button')}); guardResult=g;
     return g.evidence.map(x=>E('guardProtocol',`rgp:${x.group}`,x.weight,`RGP: ${x.reason}`,x.polarity));
   },
   integrity:()=>{
     const a=[];
     // Explicit provenance contradiction is qualitatively different from editorial
     // context. It remains a hard conflict and therefore cannot be overridden merely
     // by accumulating positive topic/generator evidence.
     if(/\b(not (?:ai[- ]generated|generated (?:by|with|using) ai)|human[- ](?:made|created|generated)|made by (?:a )?human|created by (?:a )?human)\b/.test(strong))a.push(E('integrity','hard-contradiction:human-provenance',7,'explicit human/not-AI provenance contradiction',-1));
     if(/\b(robot|robotics|cgi|3d render|digital art)\b/.test(strong)&&!/\b(generator|generated|created with ai|made with ai|synthetic media|ai\s+(?:stock\s+)?(?:image|photo|art|illustration|portrait|video|animation))\b/.test(strong))a.push(E('integrity','visual-topic-guard',3,'ordinary robot/CGI/digital-art guard',-1));
     return a;
   }
 };
 const items=RC.runOrgans(organs,{text,fingerprint:text.slice(0,240)});
 const hideAt=({conservative:7,balanced:6,high:5,maximum:4,extreme:3,'zero-ai':2})[s.level]||6; const recheckAt=({conservative:4,balanced:3,high:2,maximum:2,extreme:1,'zero-ai':1})[s.level]||3; const fused=RC.fuse(items,{hideAt,recheckAt});
 // Escalation is evidence acquisition, never automatic enforcement. Only aggressive
 // modes re-open an uncertain explicit-AI survivor, and the normal Fusion/GAIA/Warden
 // path still decides whether it may be hidden.
 if(!deepPass&&shouldDeepEscalate(card,s,ev,guardResult,fused)){
   deepPassedCards.add(card);
   const deep=googleDeepEvidence(card); const merged=mergeGoogleEvidence(ev,deep);
   const escalated=googleEvidenceDecision(card,s,true,merged);
   if(escalated)return escalated;
 }

 if(fused.state===RC.STATES.HIDE&&(s.categories.aiContent!==false||s.categories.aiPromotion)){
   const why=fused.reasons.slice(0,3).join(', ')||'multi-organ evidence';
   const cm=crossMediaClassify(strong);
   const category=cm?.category||(s.categories.aiPromotion?'AI promotion':'AI content');
   return {category,reason:`Rotary Core V3.0/RGP V2.8 (${fused.score}): ${why}`,rotaryState:fused.state,rotaryDecision:fused};
 }
 if(s.categories.aiLabels&&(text.includes('ai-generated')||text.includes('generated by ai')||text.includes('generated with ai')||text.includes('synthetic media'))) return {category:'AI label',reason:'Result-level AI/synthetic-media label',rotaryState:'HIDE'};
 if(fused.state===RC.STATES.RECHECK) scheduleCardRecheck(card);
 return null;
}

// Hatton Shield V1.1.16 — non-Google search adapters.
// Search-engine structure discovers bounded result cards only. All hide authority
// remains in the existing Core/GAIA/Warden path and requires AI-specific evidence.
function webSearchEngine(){
 const R=globalThis.HattonSearchRules;return R?.detectEngine?.(location.hostname,location.pathname)||'';
}
function isNonGoogleSearch(){return !!webSearchEngine();}
function webSearchSurface(){const e=webSearchEngine();return e?(globalThis.HattonSearchRules?.surface?.(e,location.pathname,location.search)||'search'):'none';}
function webSearchSelectors(engine=webSearchEngine()){
 if(engine==='bing')return 'li.b_algo,.b_vList li,.imgpt,.iusc,.mc_vtvc,.dg_u';
 if(engine==='duckduckgo')return '[data-testid="result"],article[data-testid="result"],.result,.tile,[data-testid*="image-tile"],[data-testid*="video-result"]';
 if(engine==='brave')return '.snippet,[data-type="web"],[data-type="news"],[data-type="video"],.image-result,.video-result';
 if(engine==='ecosia')return '[data-test-id="mainline-result"],[data-test-id*="result"],.result,[data-test-id*="image"]';
 if(engine==='yahoo')return 'div.algo,.dd.algo,li div.algo,.sres-cntr,[data-test-locator*="result"]';
 if(engine==='startpage')return '.w-gl__result,.result,[data-testid*="result"]';
 if(engine==='qwant')return '[data-testid*="result"],article';
 if(engine==='mojeek')return '.results-standard .result,.result';
 if(engine==='kagi')return '.search-result,.result,[class*="search-result"]';
 if(engine==='yandex')return '.serp-item,.Organic,.ImagesContentImage-Wrapper,[data-cid]';
 if(engine==='swisscows')return 'article,.result,[class*="result-item"]';
 return '';
}
function webSearchCardFallback(source){
 if(!isNonGoogleSearch()||!source)return null;
 let cur=source;
 for(let i=0;i<7&&cur;i++,cur=cur.parentElement){
   if(cur.matches?.(PROTECTED)||!saneTarget(cur))continue;
   const heading=cur.querySelector?.('h2,h3,[role="heading"]');
   const link=cur.querySelector?.('a[href]');if(!link||!heading)continue;
   const r=cur.getBoundingClientRect();const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1),vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
   if(r.width<140||r.height<48||r.width>Math.min(1450,vw*.96)||r.height>Math.min(720,vh*.88))continue;
   const links=cur.querySelectorAll?.('a[href]')?.length||0;if(links>28)continue;
   return cur;
 }
 return null;
}
function webSearchCardCandidate(source){
 if(!isNonGoogleSearch()||!source)return null;
 const sel=webSearchSelectors();if(sel){const card=source.matches?.(sel)?source:source.closest?.(sel);if(card&&saneTarget(card))return card;}
 return webSearchCardFallback(source);
}
function webSearchEvidence(card){
 if(!card)return {rawTitle:'',text:'',hrefs:''};
 const headings=[...card.querySelectorAll?.('h2,h3,[role="heading"]')||[]];
 const rawTitle=(headings.find(visibleBox)?.innerText||headings[0]?.textContent||'').slice(0,700);
 const bits=[card.innerText||'',card.textContent||''];const hrefs=[];
 let seen=0;for(const el of card.querySelectorAll?.('[aria-label],[aria-description],[title],img[alt],a[href]')||[]){if(++seen>140)break;for(const a of ['aria-label','title','alt']){const v=el.getAttribute?.(a);if(v)bits.push(v)}if(el.matches?.('a[href]')){const h=el.getAttribute('href')||'';hrefs.push(h);try{const u=new URL(h,location.href);hrefs.push(`${u.hostname} ${u.pathname}`)}catch{}}}
 return {rawTitle,text:normalizeEvasionText(bits.join(' ').slice(0,7000)),hrefs:normalizeEvasionText(hrefs.join(' ').slice(0,4200))};
}
function webSearchEvidenceDecision(card,s){
 if(!card||!isNonGoogleSearch()||interactiveContext(card)||s.categories?.aiContent===false)return null;
 const RC=globalThis.RotaryCoreV1,R=globalThis.HattonSearchRules;if(!RC||!R)return null;const E=RC.evidence;
 const ev=webSearchEvidence(card);if(!ev.text&&!ev.rawTitle)return null;
 if(!mutedProtected(card))for(const w of s.mutedWords||[]){const x=norm(w);if(x&&ev.text.includes(x))return {category:'Muted word',reason:`Matched "${x.slice(0,60)}"`,rotaryState:'USER_HIDE'};}
 let knownService=false;for(const a of card.querySelectorAll?.('a[href]')||[]){const h=a.getAttribute('href')||'';if(globalThis.HattonSiteGuardRules?.isKnownAiServiceUrl?.(h)){knownService=true;break;}}
 const c=R.classify({rawTitle:ev.rawTitle,text:ev.text,hrefs:ev.hrefs,knownServiceDestination:knownService});
 const organs={
   text:()=>{const a=[];if(c.explicitGenerated)a.push(E('text','search-explicit-generated',7,'Explicit AI-generated/synthetic result evidence'));if(c.generator)a.push(E('text','search-generator',6,'Explicit AI generation workflow/service'));if(s.level==='zero-ai'&&(c.ecosystem||c.boundedAi))a.push(E('topic','search-zero-ai-topic',5,'Zero-AI explicit AI topic/ecosystem result'));return a;},
   source:()=>c.knownServiceDestination?[E('source','search-ai-service-destination',4,'Known AI-first service destination')]:[],
   intent:()=>{const a=[];if(/\b(?:try|free|create|generate|generator|use online|start creating|make images|make videos)\b/.test(ev.text)&&(c.generator||c.knownServiceDestination))a.push(E('intent','search-action-context',2,'Action/promotion context corroborates AI service evidence'));return a;},
   structure:()=>[E('structure',`search-${webSearchEngine()}-${webSearchSurface()}`,1,'Bounded search-engine result card')],
   integrity:()=>c.human&&!c.explicitGenerated&&!c.generator?[E('integrity','search-human-provenance',6,'Explicit human-made/not-AI context',-1)]:[]
 };
 const items=RC.runOrgans(organs,{text:ev.text,fingerprint:ev.text.slice(0,240)});
 const fused=RC.fuse(items,{hideAt:2,recheckAt:1});
 if(fused.state===RC.STATES.RECHECK)scheduleCardRecheck(card);
 if(fused.state!==RC.STATES.HIDE)return null;
 const cat=c.generator?'AI generator':c.explicitGenerated?'AI-generated media':'AI content';
 return {category:cat,reason:`${webSearchEngine()} bounded search evidence: ${fused.reasons.slice(0,3).join('; ')}`,rotaryDecision:fused};
}

function cardLike(el){
 if(!el || !saneTarget(el)) return false;
 const r=el.getBoundingClientRect();
 const vw=Math.max(document.documentElement.clientWidth,innerWidth||0,1);
 const vh=Math.max(document.documentElement.clientHeight,innerHeight||0,1);
 if(r.width<140 || r.height<56 || r.width>Math.min(900,vw*0.72) || r.height>Math.min(520,vh*0.62)) return false;
 const structural=el.matches('article,[role=\"article\"],li,figure,[data-testid*=\"post\"],[data-e2e*=\"feed\"]');
 const hasMedia=!!el.querySelector?.('img,picture,video,svg');
 const hasLink=!!el.querySelector?.('a[href]');
 return structural || (hasLink && hasMedia);
}
function resolveMinimumTarget(source,d){
 let best=saneTarget(source)?source:null;
 const display=getComputedStyle(source).display;
 if(best && (display==='inline'||display==='contents') && saneTarget(source.parentElement)) best=source.parentElement;
 const socialCard=socialCardCandidate(source);
 if(socialCard) return socialCard;
 const googleCard=googleCardCandidate(source);
 if(googleCard) return googleCard;
 const webCard=webSearchCardCandidate(source);
 if(webCard) return webCard;
 let cur=source;
 for(let i=0;i<4 && cur?.parentElement;i++){
   cur=cur.parentElement;
   if(cur.matches(PROTECTED) || cur.querySelector?.('.rotary-shield-note')) break;
   if(!saneTarget(cur)) break;
   const semantic=cardLike(cur);
   const r=cur.getBoundingClientRect();
   const sr=source.getBoundingClientRect();
   const compact=r.height<=Math.max(320,sr.height*5) && r.width<=Math.max(760,sr.width*3.5);
   if(semantic && compact){best=cur;break;}
   if(['AI label','AI-generated media','AI generator','AI content'].includes(d.category) && compact && i<2) best=cur;
 }
 return best;
}
let hiddenCardObserver=null;
const revealedCards=new WeakSet();
const deepPassedCards=new WeakSet();
const hiddenMeta=new WeakMap();
function observeHiddenCard(card){try{hiddenCardObserver?.observe(card);}catch{}}
function unobserveHiddenCard(card){try{hiddenCardObserver?.unobserve(card);}catch{}card?.classList?.remove('rotary-offscreen-hidden');}
function reveal(card,{remember=true}={}){
 clearPendingVisual(card);
 unobserveHiddenCard(card);
 card.classList.remove('rotary-hidden-card','rotary-inline-hidden','rotary-density-minimal','rotary-density-clean','rotary-treatment-blur','rotary-surface-images','rotary-surface-videos','rotary-surface-search','rotary-surface-generic');
 const n=card.querySelector(':scope > .rotary-shield-note');if(n)n.remove();
 if(remember)revealedCards.add(card);else revealedCards.delete(card);
}
function displayReason(d,mode){
 if(mode==='compact') return `${d.category}`;
 return 'AI content hidden';
}
function makeEyeSlashIcon(){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('rotary-eye-icon');
 const eye=document.createElementNS(svg.namespaceURI,'path');eye.setAttribute('d','M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z');
 const pupil=document.createElementNS(svg.namespaceURI,'circle');pupil.setAttribute('cx','12');pupil.setAttribute('cy','12');pupil.setAttribute('r','2.6');
 const slash=document.createElementNS(svg.namespaceURI,'path');slash.setAttribute('d','M4 4l16 16');
 svg.append(eye,pupil,slash);return svg;
}
function placeholderKind(card){
 if(!card||!card.isConnected)return 'card';
 const r=card.getBoundingClientRect(); const cs=getComputedStyle(card);
 const inlineish=cs.display==='inline'||cs.display==='inline-block'||r.width<180||r.height<54;
 return inlineish?'inline':'card';
}
function placeholderSafeTarget(card){
 if(!card||!card.isConnected)return null;
 const targetSane=(el)=>socialPlatform()==='tiktok'?(saneTarget(el)||tiktokTargetSane(el)):saneTarget(el);
 let cur=card;
 for(let i=0;i<3&&cur;i++,cur=cur.parentElement){
   if(!targetSane(cur)||cur.matches(PROTECTED))continue;
   const r=cur.getBoundingClientRect();
   // A placeholder needs enough real geometry to keep both label and Show button legible.
   // Avoid narrow inline/link fragments that produced the collapsed live placeholder.
   const cs=getComputedStyle(cur);
   const inlineish=cs.display==='inline'||cs.display==='contents';
   if(!inlineish&&r.width>=150&&r.height>=54)return cur;
 }
 return targetSane(card)?card:null;
}
function normalizePlaceholderOrientation(card,note){
 // Google occasionally rotates/recycles video-result wrappers. A child inherits that
 // transform, so `transform:none` on the placeholder is insufficient. Counter only a
 // clear 180-degree ancestor rotation; do not cancel translations/scales used for layout.
 let cur=card;
 for(let depth=0;cur&&depth<6;cur=cur.parentElement,depth++){
   const t=getComputedStyle(cur).transform;
   if(!t||t==='none')continue;
   try{
     const m=new DOMMatrixReadOnly(t);
     if(m.is2D && m.a < -0.85 && m.d < -0.85 && Math.abs(m.b)<0.2 && Math.abs(m.c)<0.2){
       note.style.setProperty('transform','rotate(180deg)','important');
       note.style.setProperty('transform-origin','50% 50%','important');
       return;
     }
   }catch{}
 }
}
async function hide(card,d,s){
 clearPendingVisual(card);
 const requestedKind=placeholderKind(card);
 card=placeholderSafeTarget(card);
 if(!card || revealedCards.has(card)||card.classList.contains('rotary-hidden-card'))return;
 const gaia=globalThis.RotaryGaiaV14||globalThis.RotaryGaiaV13;
 const auth=gaia?.Warden?.authorizeAction?.(card,d);
 if(gaia && !auth?.accepted)return;
 const trust=globalThis.RotaryTrustV14;
 if(trust&&!trust.assertAuthority('action','MODIFY_DOM').allowed)return;
 if(d?.rotaryDecision){trust?.ShadowDiagnostics?.observe?.(d.rotaryDecision,{surface:isGoogleSearch()?googleSurface():(isNonGoogleSearch()?webSearchSurface():(socialPlatform()||'generic'))});trust?.OutcomeMonitor?.record?.(d.rotaryDecision,{surface:isGoogleSearch()?googleSurface():(isNonGoogleSearch()?webSearchSurface():'generic'),reasonCode:d.category==='AI-generated media'?'R-HIDE-AIMEDIA':d.category==='AI generator'?'R-HIDE-GEN':d.category==='AI promotion'?'R-HIDE-PROMO':'R-HIDE-OTHER'});}
 card.classList.add('rotary-hidden-card');
 const rotarySurface=isGoogleSearch()?googleSurface():(isNonGoogleSearch()?webSearchSurface():(socialPlatform()||'generic'));
 card.classList.add(`rotary-surface-${rotarySurface}`);
 // Video/social placeholders use a compositor-safe cover in V1.1.24, so they do not
 // need offscreen blur toggling. Avoiding those class flips removes a scroll-flicker path.
 if((s.placeholderTreatment||'blur')==='blur'&&!['videos','youtube','tiktok','instagram','facebook','threads','x','reddit','linkedin','twitch','discord','pinterest','bluesky','mastodon','tumblr'].includes(rotarySurface))observeHiddenCard(card);
 card.classList.toggle('rotary-inline-hidden',requestedKind==='inline');
 card.classList.toggle('rotary-density-minimal',(s.placeholderDensity||'normal')==='minimal');
 card.classList.toggle('rotary-density-clean',(s.placeholderDensity||'normal')==='clean');
 card.classList.toggle('rotary-treatment-blur',(s.placeholderTreatment||'blur')==='blur');
 hiddenMeta.set(card,{category:d.category||'Content'});
 if(s.explain){
   const note=document.createElement('div');note.className='rotary-shield-note';note.setAttribute('role','status');note.setAttribute('data-rotary-ui','1');
   const icon=makeEyeSlashIcon(); const textWrap=document.createElement('span');textWrap.className='rotary-note-text';textWrap.textContent=displayReason(d,s.placeholderMode||'minimal');
   const btn=document.createElement('button');btn.type='button';btn.textContent='Show';btn.setAttribute('aria-label','Show content hidden by Hatton Shield');
   btn.addEventListener('click',()=>reveal(card));note.append(icon,textWrap,btn);card.prepend(note);normalizePlaceholderOrientation(card,note);
 }
}
// Rotary Core delayed second pass: borderline cards are watched briefly for lazy metadata.
const recheckTimers=new WeakMap();
function scheduleCardRecheck(card){
 if(!card||recheckTimers.has(card)||!card.isConnected)return;
 const t=setTimeout(()=>{recheckTimers.delete(card);if(!card.isConnected)return;enqueuePriorityCard(card,{visual:false});scheduleScan(35);},420);
 recheckTimers.set(card,t);
}

// Dynamic-card lifecycle engine (V1.1.19 performance repair).
// Detection/evidence policy is unchanged; this layer only bounds repeated DOM work.
let busy=false;
let timer=null;
let scanDue=0;
let cachedEnabled=false;
let cachedState=null;
let statePromise=null;
const pending=new Set();
const priorityPending=new Set();
const fingerprint=new WeakMap();
const cardIdentity=new WeakMap();
const pendingVisualTimers=new WeakMap();
const refreshPlans=new WeakMap();
const MAX_BATCH=280;
const MAX_PENDING=3200;
const MAX_DESCENDANTS_PER_MUTATION=160;
const MAX_PLATFORM_DESCENDANTS=48;
const INITIAL_GENERIC_LIMIT=700;
const INITIAL_PLATFORM_LIMIT=280;
function pendingCount(){return pending.size+priorityPending.size;}
function clearPendingVisual(card){
 if(!card)return;
 card.classList?.remove('rotary-pending-card');
 const t=pendingVisualTimers.get(card);if(t){clearTimeout(t);pendingVisualTimers.delete(card);}
}
function markPendingVisual(card){
 // No pre-evaluation blur/blanking. Priority scheduling handles latency without
 // visually changing undecided content.
 return;
}
function enqueuePriorityCard(card,{visual=true}={}){
 if(!card||!card.isConnected||card.closest?.('.rotary-hidden-card'))return;
 priorityPending.add(card);
 if(visual)markPendingVisual(card);
}
function platformCardIdentity(card){
 if(!card||!card.isConnected)return '';
 const p=socialPlatform(); const out=[];
 const selectors=p==='youtube'?'a[href*="/watch"],a[href*="/shorts/"]':p==='tiktok'?'a[href*="/video/"],a[href*="/shop"],a[href*="/product"],a[href*="/view/product"]':'a[href]';
 for(const a of card.querySelectorAll?.(selectors)||[]){
   const h=a.getAttribute?.('href')||'';if(!h)continue;
   try{const u=new URL(h,location.href);
     if(isGoogleSearch()&&u.hostname===location.hostname&&u.pathname==='/search')continue;
     out.push(`${u.hostname}${u.pathname}${p?u.searchParams.get('v')||'':''}`);
   }catch{out.push(h.split('#')[0].split('?')[0]);}
   if(out.length>=4)break;
 }
 return norm([...new Set(out)].join('|').slice(0,1200));
}
function evidenceFingerprint(el){
 if(!el||!el.isConnected)return '';
 // V1.1.26: TikTok may keep the caption/hashtags/AIGC badge in siblings of the
 // smaller media subtree used as the hide target. Fingerprint the bounded enclosing
 // evidence scope so late hydration cannot be mistaken for an unchanged card.
 const fpScope=socialPlatform()==='tiktok'?tiktokEvidenceScope(el):el;
 // V1.1.23 lifecycle fingerprint: detect meaningful card changes without running the
 // full evidence extractor twice. textContent/attributes do not force layout; the
 // actual evidence/decision functions below remain the only classification authority.
 const bits=[directText(fpScope)];
 const phraseBits=[];
 let raw='';
 try{raw=(fpScope.textContent||'').slice(0,4200);}catch{}
 // Ignore volatile counters/timestamps that can churn while a video feed is scrolling.
 raw=raw.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g,' #time ')
        .replace(/\b\d+(?:[.,]\d+)?\s*[kmb]?\s*(?:views?|likes?|comments?|shares?)\b/gi,' #metric ');
 if(raw){bits.push(raw);phraseBits.push(raw);}
 if(socialPlatform()){
   const H=globalThis.HattonHashtagOrganV1;
   if(H){
     const hrefBits=[];let hs=0;
     for(const a of fpScope.querySelectorAll?.('a[href*="/tag/"],a[href*="/hashtag/"],a[href*="/explore/tags/"],a[href*="hashtag"],a[href*="keywords="]')||[]){const h=a.getAttribute?.('href');if(h)hrefBits.push(h);if(++hs>=24)break;}
     const sig=H.signature({text:raw,hrefs:hrefBits.join(' ')});if(sig)bits.push(`hashtags:${sig}`);
   }
 }
 let seen=0;
 for(const n of fpScope.querySelectorAll?.('a[href],[aria-label],[aria-description],[title],img[alt],[data-e2e],[data-testid],[data-title],[data-caption],[data-desc],[data-description],[data-author],[data-creator],[data-username],[data-nickname],[data-product-title],[data-product-name],[data-ad-title],[data-advertiser],[data-ai-label],[data-content-label],[data-generated-by],[data-generator],[data-source],[data-domain],[data-url],[data-context]')||[]){
   if(++seen>42)break;
   if(n.matches?.('a[href]')){const h=n.getAttribute?.('href');if(h)bits.push(h.slice(0,420));}
   for(const a of ['aria-label','aria-description','title','alt','data-e2e','data-testid','data-title','data-caption','data-desc','data-description','data-author','data-creator','data-username','data-nickname','data-product-title','data-product-name','data-ad-title','data-advertiser','data-ai-label','data-content-label','data-generated-by','data-generator','data-source','data-domain','data-url','data-context']){
     const v=n.getAttribute?.(a);if(v){const sv=String(v).slice(0,320);bits.push(sv);phraseBits.push(sv);}
   }
   if(bits.join(' ').length>4800)break;
 }
 if(socialPlatform()){
   const P=globalThis.HattonSocialPhraseOrganV1;
   if(P){const sig=P.signature({text:phraseBits.join(' ').slice(0,7200)});if(sig)bits.push(`phrases:${sig}`);}
 }
 return norm(bits.join(' ').slice(0,5600));
}
function loadStateOnce(){
 if(cachedState)return Promise.resolve(cachedState);
 if(statePromise)return statePromise;
 statePromise=browser.runtime.sendMessage({type:'ROTARY_GET_STATE'}).then(r=>{
   cachedState=r?.state||null;cachedEnabled=!!cachedState?.enabled;return cachedState;
 }).catch(()=>{cachedEnabled=false;return null;}).finally(()=>{statePromise=null;});
 return statePromise;
}
function updateCachedStateFromChanges(changes){
 if(!cachedState)return;
 for(const k of ['enabled','explain','placeholderMode','placeholderDensity','placeholderTreatment','categories','mutedWords','socialSites','aiSiteBlock']){
   if(changes[k])cachedState[k]=changes[k].newValue;
 }
 cachedState.level='zero-ai';cachedEnabled=cachedState.enabled!==false;
}
function cancelRefreshPlan(card){
 const prev=refreshPlans.get(card);if(!prev)return;
 if(prev.timer)clearTimeout(prev.timer);
 refreshPlans.delete(card);
}
function scheduleRefreshPlan(card,delays,scanDelay=30){
 if(!card||!card.isConnected||card.closest?.('.rotary-hidden-card'))return;
 const now=Date.now();
 const identity=platformCardIdentity(card)||'node';
 const steps=[...new Set(delays)].sort((a,b)=>a-b);
 const lastDelay=Math.max(0,...steps);
 const prev=refreshPlans.get(card);
 // Repeated MutationObserver hits for the same virtual card must not multiply timers.
 if(prev&&prev.identity===identity&&prev.expiresAt>now)return;
 if(prev)cancelRefreshPlan(card);
 // V1.1.23: one live timer per card. Earlier builds armed every hydration stage at
 // once; fast scrolling could leave hundreds/thousands of pending timers behind.
 const plan={identity,start:now,expiresAt:now+lastDelay+8000,steps,index:0,timer:null};
 refreshPlans.set(card,plan);
 const arm=()=>{
   if(refreshPlans.get(card)!==plan)return;
   if(plan.index>=plan.steps.length){plan.timer=null;plan.steps=[];plan.start=0;return;}
   const targetAt=plan.start+plan.steps[plan.index++];
   plan.timer=setTimeout(()=>{
     plan.timer=null;
     if(!card.isConnected||card.closest?.('.rotary-hidden-card')){refreshPlans.delete(card);return;}
     enqueuePriorityCard(card,{visual:false});scheduleScan(scanDelay);
     arm();
   },Math.max(0,targetAt-Date.now()));
 };
 arm();
}
function queuePlatformCardForRefresh(source,delays=[300,1000,2500]){
 const platform=socialPlatform();
 if(platform==='tiktok')delays=[35,250,700,1600,3000];
 else if(platform==='youtube')delays=[35,300,900,1900];
 else if(isNonGoogleSearch())delays=[80,350,1000,2200];
 const card=isGoogleSearch()?googleCardCandidate(source):(isNonGoogleSearch()?webSearchCardCandidate(source):socialCardCandidate(source));
 if(!card||!card.isConnected||card.closest?.('.rotary-hidden-card'))return;
 enqueuePriorityCard(card,{visual:true});
 scheduleRefreshPlan(card,delays,30);
}
function queueElement(el){
 if(!el||el.nodeType!==Node.ELEMENT_NODE||!el.isConnected)return;
 if(el.closest?.('[data-rotary-ui],.rotary-shield-note,.rotary-hidden-card'))return;
 const platformPage=!!(isGoogleSearch()||isNonGoogleSearch()||socialPlatform());
 const semantic=el.matches?.(TARGETS)?el:el.closest?.(TARGETS);
 if(semantic&&semantic.isConnected)pending.add(semantic);
 if(pendingCount()<MAX_PENDING){
   const social=socialPlatform();
   // Video/social feeds keep only a tiny direct-text lane for explicit labels/muted
   // words while their dedicated card adapter handles the full card. This preserves
   // user rules without recursively walking dozens of generic descendants per mutation.
   const selector=social?'p,h1,h2,h3,h4,[role="heading"],a[href],[aria-label],[aria-description],[title],img[alt]':TARGETS;
   const limit=social?10:(platformPage?MAX_PLATFORM_DESCENDANTS:MAX_DESCENDANTS_PER_MUTATION);let added=0;
   for(const n of el.querySelectorAll?.(selector)||[]){pending.add(n);if(++added>=limit||pendingCount()>=MAX_PENDING)break;}
 }
 // V1.1.16: non-Google search results get a bounded priority path. Result-card
 // structure is discovery only; webSearchEvidenceDecision still requires AI evidence.
 if(isNonGoogleSearch()&&pendingCount()<MAX_PENDING){
   const sel=webSearchSelectors();const candidates=[];
   if(sel&&el.matches?.(sel))candidates.push(el);
   if(sel)for(const n of el.querySelectorAll?.(sel)||[]){candidates.push(n);if(candidates.length>=140)break;}
   const seen=new Set();for(const n of candidates){const card=webSearchCardCandidate(n);if(!card||seen.has(card))continue;seen.add(card);enqueuePriorityCard(card,{visual:true});scheduleRefreshPlan(card,[80,350,1000,2200],30);if(pendingCount()>=MAX_PENDING)break;}
 }
 // V1.1.12 YouTube: explicitly enqueue owners of watch/shorts anchors so
 // renderer metadata split across sibling branches still reaches the social adapter.
 if(socialPlatform()==='youtube'&&pendingCount()<MAX_PENDING){
   const anchors=[]; if(el.matches?.('a[href*="/watch"],a[href*="/shorts/"]'))anchors.push(el);
   for(const a of el.querySelectorAll?.('a[href*="/watch"],a[href*="/shorts/"]')||[]){anchors.push(a);if(anchors.length>=100)break;}
   for(const a of anchors){const card=youtubeVideoCardFallback(a);if(card){enqueuePriorityCard(card,{visual:true});scheduleRefreshPlan(card,[90,300,900,1900],30);}if(pendingCount()>=MAX_PENDING)break;}
 }
 // TikTok V1.1.4: explicitly enqueue bounded /video/ card owners when the SPA
 // hydrates or recycles a result. This supplements the proven base queue; it does
 // not replace it and does not affect Google/YouTube routing.
 if(socialPlatform()==='tiktok'&&pendingCount()<MAX_PENDING){
   const anchors=[];
   if(el.matches?.('a[href*="/video/"]'))anchors.push(el);
   for(const a of el.querySelectorAll?.('a[href*="/video/"]')||[]){anchors.push(a);if(anchors.length>=80)break;}
   for(const a of anchors){
     const card=tiktokVideoCardFallback(a);
     if(card){
       enqueuePriorityCard(card,{visual:true});
       // Preserve the proven stages, but deduplicate them per virtual card identity.
       scheduleRefreshPlan(card,[35,350,1200],30);
     }
     if(pendingCount()>=MAX_PENDING)break;
   }
   // V1.1.26: captions, hashtag links and TikTok's AIGC badge can hydrate beside
   // the media subtree. Treat those nodes as refresh triggers and resolve them back
   // to the existing bounded hide target instead of waiting for another video-anchor mutation.
   const evidenceTriggers=[];
   if(el.matches?.(TIKTOK_EVIDENCE_SELECTOR))evidenceTriggers.push(el);
   for(const n of el.querySelectorAll?.(TIKTOK_EVIDENCE_SELECTOR)||[]){evidenceTriggers.push(n);if(evidenceTriggers.length>=40)break;}
   const evidenceCards=new Set();
   for(const n of evidenceTriggers){
     const card=socialCardCandidate(n);if(!card||evidenceCards.has(card))continue;evidenceCards.add(card);
     enqueuePriorityCard(card,{visual:true});scheduleRefreshPlan(card,[35,250,700,1600],30);
     if(pendingCount()>=MAX_PENDING)break;
   }
   // V1.1.15: discover Shop/product/photo/slideshow/sponsored cards that may not own
   // a /video/ URL. Discovery has no decision authority; the same evidence fusion runs.
   const aux=[]; const auxSel='a[href*="/shop"],a[href*="/product"],a[href*="/view/product"],[data-e2e*="shop"],[data-e2e*="product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"],[data-e2e*="sponsor"],[data-e2e*="ad-"],[data-testid*="shop"],[data-testid*="product"],[data-testid*="photo"],[data-testid*="slide"],[data-testid*="carousel"],[data-testid*="sponsor"]';
   if(el.matches?.(auxSel))aux.push(el);
   for(const n of el.querySelectorAll?.(auxSel)||[]){aux.push(n);if(aux.length>=90)break;}
   const seenCards=new Set();
   for(const n of aux){
     const card=tiktokAuxCardFallback(n); if(!card||seenCards.has(card))continue; seenCards.add(card);
     enqueuePriorityCard(card,{visual:true});
     scheduleRefreshPlan(card,[90,320,900,1800],30);
     if(pendingCount()>=MAX_PENDING)break;
   }
 }
}
function queueRoot(root){
 if(root===document||root===document.documentElement){
   const platformPage=!!(isGoogleSearch()||isNonGoogleSearch()||socialPlatform());
   // Initial generic discovery is bounded. Platform adapters below remain the priority path.
   let generic=0;for(const n of document.querySelectorAll(TARGETS)){pending.add(n);if(++generic>=(platformPage?INITIAL_PLATFORM_LIMIT:INITIAL_GENERIC_LIMIT)||pendingCount()>=MAX_PENDING)break;}
   const sp=socialPlatform(),ss=socialCardSelector(sp),seedSel=socialSeedSelector(sp); const seeds=isGoogleSearch()?document.querySelectorAll('a[href],img[alt],h3,[role="heading"],video'):isNonGoogleSearch()?document.querySelectorAll(`${webSearchSelectors()},main h2,main h3,main [role="heading"]`):sp==='youtube'?document.querySelectorAll('a[href*="/watch"],a[href*="/shorts/"],ytd-rich-item-renderer,ytd-video-renderer,ytm-video-with-context-renderer'):sp==='tiktok'?document.querySelectorAll('article[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item-container"],[data-e2e="recommend-list-item"],a[href*="/video/"],[data-e2e="search-card-video"],[data-e2e="video-desc"],[data-e2e="browse-video-desc"],[data-e2e="aigc-tag"],[data-e2e*="aigc"],[data-e2e*="video-card"],[data-e2e*="search-item"],a[href*="/shop"],a[href*="/product"],a[href*="/view/product"],[data-e2e*="shop"],[data-e2e*="product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"],[data-e2e*="sponsor"],[data-e2e*="ad-"],[data-testid*="shop"],[data-testid*="product"],[data-testid*="photo"],[data-testid*="slide"],[data-testid*="carousel"],[data-testid*="sponsor"]'):seedSel?document.querySelectorAll(seedSel):[];
   let seeded=0;for(const n of seeds){queuePlatformCardForRefresh(n);if(++seeded>=260||pendingCount()>=MAX_PENDING)break;}
 }else queueElement(root);
 scheduleScan(30);
}
function platformScanDelay(){return socialPlatform()?72:(isGoogleSearch()||isNonGoogleSearch()?40:110);}
function scanBatchLimit(){return socialPlatform()?110:(isGoogleSearch()||isNonGoogleSearch()?190:MAX_BATCH);}
function scheduleScan(delay=120){
 const now=(globalThis.performance?.now?.()??Date.now()); const due=now+Math.max(0,delay);
 // Mutation storms must not keep postponing a scan. Keep the earliest scheduled deadline.
 if(timer&&scanDue<=due)return;
 if(timer)clearTimeout(timer);
 scanDue=due; timer=setTimeout(()=>{timer=null;scanDue=0;scan();},Math.max(0,due-now));
}
async function scan(){
 if(busy){scheduleScan(25);return;}busy=true;
 try{
   const s=cachedState||await loadStateOnce();
   if(!s?.enabled){cachedEnabled=false;pending.clear();priorityPending.clear();document.querySelectorAll('.rotary-pending-card').forEach(clearPendingVisual);return;}
   let count=0;
   cachedEnabled=!!s.enabled;
   const batchLimit=scanBatchLimit();
   while((priorityPending.size||pending.size)&&count<batchLimit){
     const q=priorityPending.size?priorityPending:pending;
     const it=q.values().next();const rawEl=it.value;q.delete(rawEl);count++;
     if(!rawEl?.isConnected||rawEl.closest?.('[data-rotary-ui],.rotary-shield-note,.rotary-hidden-card')||rawEl.querySelector?.(':scope > .rotary-shield-note')){clearPendingVisual(rawEl);continue;}
     // Preserve V1.1.13 social card-first canonicalization. Priority scheduling changes
     // WHEN a card is processed; the working social decision order remains intact.
     const socialOwner=socialEnabled(s)?socialCardCandidate(rawEl):null;
     const el=socialOwner||rawEl;
     const fp=evidenceFingerprint(el);
     if(!fp){clearPendingVisual(el);continue;}
     if(fingerprint.get(el)===fp){clearPendingVisual(el);continue;}
     // Meaningful DOM change invalidates private per-card cache state before rescoring.
     deepPassedCards.delete(el);
     fingerprint.set(el,fp);
     const text=directText(el);
     let d=text?decide(text,s,el):null;
     let target=d?resolveMinimumTarget(el,d):null;
     if(!d){
       const gc=googleCardCandidate(el);
       const wc=webSearchCardCandidate(el);
       const sc=socialCardCandidate(el);
       const owner=gc||wc||(sc&&socialEnabled(s)?sc:null);
       if(owner){
         const identity=platformCardIdentity(owner),oldIdentity=cardIdentity.get(owner);
         if(oldIdentity&&identity&&oldIdentity!==identity){revealedCards.delete(owner);deepPassedCards.delete(owner);fingerprint.delete(owner);}
         if(identity)cardIdentity.set(owner,identity);
       }
       if(gc){d=googleEvidenceDecision(gc,s);if(d)target=gc;}
       else if(wc){d=webSearchEvidenceDecision(wc,s);if(d)target=wc;}
       else if(sc&&socialEnabled(s)){d=socialEvidenceDecision(sc,s);if(d)target=sc;}
       else if(cardLike(el)&&s.categories.aiContent!==false){
       }
     }
     if(d&&target)await hide(target,d,s);
     else clearPendingVisual(target||el);
   }
 }finally{
   busy=false;
   if(priorityPending.size||pending.size)scheduleScan(platformScanDelay());
 }
}
browser.storage.onChanged.addListener((changes,area)=>{
 if(area!=='local') return;
 updateCachedStateFromChanges(changes);
 if(changes.enabled){cachedEnabled=changes.enabled.newValue!==false;if(!cachedEnabled)document.querySelectorAll('.rotary-pending-card').forEach(clearPendingVisual);}
 if(changes.placeholderMode){
   const mode=changes.placeholderMode.newValue||'minimal';
   document.querySelectorAll('.rotary-hidden-card').forEach(card=>{
     const span=card.querySelector(':scope > .rotary-shield-note .rotary-note-text');
     if(!span)return;
     const cat=hiddenMeta.get(card)?.category||'Content';
     span.textContent=mode==='compact'?cat:'AI content hidden';
   });
 }
 if(changes.enabled||changes.categories||changes.socialSites||changes.mutedWords||changes.explain||changes.level||changes.placeholderDensity||changes.placeholderTreatment){
   document.querySelectorAll('.rotary-hidden-card').forEach(card=>reveal(card,{remember:false}));
   // WeakMap fingerprints cannot be cleared, so force a changed fingerprint by
   // deleting entries for the currently reachable candidate set while queuing it.
   for(const el of document.querySelectorAll(TARGETS)){fingerprint.delete(el);pending.add(el);if(pendingCount()>=MAX_PENDING)break;}
   scheduleScan(60);
 }
});
function observerDirtyOwner(el){
 if(!el||el.nodeType!==Node.ELEMENT_NODE)return el;
 const p=socialPlatform(),sel=socialCardSelector(p);
 return (sel?el.closest?.(sel):null)||el;
}
const obs=new MutationObserver(mutations=>{
 (globalThis.RotaryGaiaV14||globalThis.RotaryGaiaV13)?.Buffer?.mutation?.(mutations.length);
 const dirty=new Set();const addedRoots=new Set();
 const social=!!socialPlatform(); const dirtyCap=social?140:240;
 // Coalesce a noisy framework mutation batch before doing any subtree/platform work.
 // One recycled card can generate many text/attribute records; collapse those records
 // to the nearest known video-card owner before any evidence work begins.
 for(const m of mutations){
   if(dirty.size>=dirtyCap)break;
   if(m.type==='childList'){
     if(m.target?.nodeType===Node.ELEMENT_NODE)dirty.add(observerDirtyOwner(m.target));
     for(const n of m.addedNodes){if(n.nodeType===Node.ELEMENT_NODE){dirty.add(observerDirtyOwner(n));addedRoots.add(n);if(dirty.size>=dirtyCap)break;}}
   }else if(m.type==='characterData'&&m.target?.parentElement){
     const changed=String(m.target.data||'').trim();
     // Pure counters/timestamps cannot add AI evidence; ignore their high-frequency
     // updates on video feeds instead of rescanning an otherwise unchanged card.
     if(social&&(!changed||/^[\d\s:.,+kmb]+$/i.test(changed)))continue;
     dirty.add(observerDirtyOwner(m.target.parentElement));
   }else if(m.type==='attributes'&&m.target?.nodeType===Node.ELEMENT_NODE)dirty.add(observerDirtyOwner(m.target));
 }
 const processLimit=social?100:180;let processed=0;
 for(const el of dirty){queueElement(el);queuePlatformCardForRefresh(el);if(++processed>=processLimit)break;}
 const observeLimit=social?48:80;let observed=0;
 for(const el of addedRoots){observeViewportCandidateNode(el);if(++observed>=observeLimit)break;}
 scheduleScan(platformScanDelay());
});
obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-description','title','alt','href','data-e2e','data-testid','data-title','data-caption','data-desc','data-description','data-author','data-creator','data-username','data-nickname','data-product-title','data-product-name','data-ad-title','data-advertiser','data-ai-label','data-content-label','data-generated-by','data-generator']});
hiddenCardObserver=new IntersectionObserver(entries=>{
 for(const e of entries){
   if(!e.target?.classList?.contains('rotary-hidden-card'))continue;
   e.target.classList.toggle('rotary-offscreen-hidden',!e.isIntersecting);
 }
},{root:null,rootMargin:'500px 0px',threshold:0});

// IntersectionObserver catches virtualised/recycled cards that become relevant when
// they enter the viewport. It no longer invalidates fingerprints simply because a card
// crossed the viewport boundary, preventing scroll-in/out rescans of unchanged cards.
const viewportObserver=new IntersectionObserver(entries=>{
 for(const e of entries){if(e.isIntersecting){queueElement(e.target);queuePlatformCardForRefresh(e.target);}}
 scheduleScan(platformScanDelay());
},{root:null,rootMargin:'650px 0px',threshold:0});
function viewportSelectorForPage(){
 const p=socialPlatform(),sel=socialCardSelector(p);
 if(p==='tiktok')return `${sel},[data-e2e="search-card-video"],[data-e2e="video-desc"],[data-e2e="browse-video-desc"],[data-e2e="aigc-tag"]`;
 const seed=socialSeedSelector(p);
 return seed||VIEWPORT_TARGETS;
}
function observeViewportCandidates(root=document){
 const selector=viewportSelectorForPage();
 const nodes=root===document?document.querySelectorAll(selector):root.querySelectorAll?.(selector)||[];
 const limit=root===document?(socialPlatform()?320:500):(socialPlatform()?48:80);let count=0;
 for(const el of nodes){viewportObserver.observe(el);if(++count>=limit)break;}
 // V1.1.22: Google Images masonry tiles are often plain div wrappers and therefore
 // do not match the generic viewport target list. Observe the media nodes themselves;
 // when one approaches the viewport, queuePlatformCardForRefresh() resolves the same
 // bounded Google Images card owner used by the decision engine. IntersectionObserver
 // is used here specifically to avoid returning to full-document polling/rescans.
 if(isGoogleSearch()&&googleSurface()==='images') {
   const imgs=root===document?document.querySelectorAll('img'):root.querySelectorAll?.('img')||[];
   const imgLimit=root===document?1200:140;let seen=0;
   for(const img of imgs){
     if(!img.isConnected||img.closest?.('[data-rotary-ui],.rotary-shield-note,.rotary-hidden-card'))continue;
     viewportObserver.observe(img);
     if(++seen>=imgLimit)break;
   }
 }
}
function observeViewportCandidateNode(n){
 if(!n||n.nodeType!==Node.ELEMENT_NODE)return;
 const selector=viewportSelectorForPage();
 if(n.matches?.(selector))viewportObserver.observe(n);
 if(isGoogleSearch()&&googleSurface()==='images'&&n.matches?.('img')&&!n.closest?.('[data-rotary-ui],.rotary-shield-note,.rotary-hidden-card'))viewportObserver.observe(n);
 observeViewportCandidates(n);
}
observeViewportCandidates();
if(socialPlatform()==='tiktok'){
 const auxSel='a[href*="/shop"],a[href*="/product"],a[href*="/view/product"],[data-e2e*="shop"],[data-e2e*="product"],[data-e2e*="photo"],[data-e2e*="slide"],[data-e2e*="carousel"],[data-e2e*="sponsor"],[data-e2e*="ad-"],[data-testid*="shop"],[data-testid*="product"],[data-testid*="photo"],[data-testid*="slide"],[data-testid*="carousel"],[data-testid*="sponsor"]';
 let auxCount=0;for(const el of document.querySelectorAll(auxSel)){viewportObserver.observe(el);if(++auxCount>=260)break;}
}
loadStateOnce().then(s=>{cachedEnabled=!!s?.enabled;if(!cachedEnabled)document.querySelectorAll('.rotary-pending-card').forEach(clearPendingVisual);}).catch(()=>{cachedEnabled=false;});
queueRoot(document);

// HATTON 1.1.12 SURVIVOR CLOSURE lineage preserved.
// HATTON 1.1.15 TIKTOK CARD-TYPE SURVIVOR CLOSURE + PRECISION GUARDS.
// HATTON 1.1.16 MULTI-SEARCH COVERAGE + AI-SITE AWARENESS.
// HATTON 1.1.18 TIKTOK HASHTAG PRECISION — bounded hashtag provenance, tag-link recovery, anti-AI/human-made protection.
// HATTON 1.1.19 PERFORMANCE / I/O REPAIR — cached state, bounded traversal, deduplicated refresh plans, one mutation pipeline, offscreen blur relief.
// HATTON 1.1.20 FIREFOX PUBLIC HARDENING — host-page decision traces removed; temporary site allowances moved to extension-owned session state.
// HATTON 1.1.21 GOOGLE HOVER REPAIR — pre-hover card discovery and bounded dormant metadata extraction.

// HATTON 1.1.22 GOOGLE IMAGES VIEWPORT REPAIR — evaluate masonry tiles on viewport approach rather than hover mutation.
// HATTON 1.1.23 VIDEO FEED PERFORMANCE / FLICKER REPAIR — cheap lifecycle fingerprints, one timer per card, social fast-path traversal, bounded batches and compositor-safe video placeholders.

// HATTON 1.1.24 SOCIAL SURVIVOR CLOSURE — shared bounded hashtag organ, late-hydration fingerprinting and conservative major-social card adapters.
// HATTON 1.1.25 SOCIAL PHRASE / METADATA CLOSURE — shared non-hashtag phrase organ, source-aware bounded metadata evidence and late phrase-hydration fingerprinting.
// HATTON 1.1.26 TIKTOK CANONICAL EVIDENCE CLOSURE — bounded outer evidence scope, explicit caption/AIGC nodes, and sibling-hydration refresh triggers.

// HATTON FIREFOX 1.2.0 EXPANDED COVERAGE — V1.1.26 evidence foundation plus bounded Twitch/Discord/Pinterest/Bluesky/Mastodon/Tumblr social adapters and additional search engines.
