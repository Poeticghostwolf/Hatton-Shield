(function(g){
'use strict';
// Hatton Shield Chromium V1.2.0 — pure search-engine classification helpers.
// Engine/card shape is discovery only; it never constitutes AI evidence.
function n(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim()}
function detectEngine(hostname,pathname='/'){
 const h=String(hostname||'').toLowerCase().replace(/\.$/,''); const p=String(pathname||'/');
 if(/(^|\.)bing\.com$/.test(h)&&(p==='/search'||p.startsWith('/images/search')||p.startsWith('/videos/search')))return 'bing';
 if(/(^|\.)duckduckgo\.com$/.test(h))return 'duckduckgo';
 if(h==='search.brave.com')return 'brave';
 if(/(^|\.)ecosia\.org$/.test(h)&&(p.startsWith('/search')||p.startsWith('/images')))return 'ecosia';
 if((h==='search.yahoo.com'||h==='images.search.yahoo.com'||h.endsWith('.search.yahoo.com')))return 'yahoo';
 if((h==='startpage.com'||h==='www.startpage.com')&&(p.includes('/search')||p.includes('/sp/search')||p.includes('/do/search')||p==='/'))return 'startpage';
 if((h==='qwant.com'||h==='www.qwant.com')&&(p==='/'||p.startsWith('/web')||p.startsWith('/images')||p.startsWith('/videos')||p.startsWith('/news')))return 'qwant';
 if((h==='mojeek.com'||h==='www.mojeek.com')&&p.startsWith('/search'))return 'mojeek';
 if((h==='kagi.com'||h==='www.kagi.com')&&p.startsWith('/search'))return 'kagi';
 if((h==='yandex.com'||h==='www.yandex.com'||h==='yandex.ru'||h==='www.yandex.ru'||h.startsWith('images.yandex.')||h.startsWith('yandex.'))&&(p.startsWith('/search')||p.startsWith('/images')||p.startsWith('/video')||h.startsWith('images.yandex.')))return 'yandex';
 if((h==='swisscows.com'||h==='www.swisscows.com')&&(p==='/'||/\/(?:[a-z]{2}\/)?(?:web|images|video|news)(?:\/|$)/i.test(p)))return 'swisscows';
 return '';
}
function surface(engine,pathname='/',search=''){
 const p=String(pathname||'/').toLowerCase(),q=String(search||'').toLowerCase();
 if(engine==='bing'){if(p.startsWith('/images/'))return 'images';if(p.startsWith('/videos/'))return 'videos';return 'search';}
 if(engine==='duckduckgo'){if(/(?:^|[?&])iax=images(?:&|$)/.test(q)||/(?:^|[?&])ia=images(?:&|$)/.test(q))return 'images';if(/(?:^|[?&])iax=videos(?:&|$)/.test(q))return 'videos';return 'search';}
 if(engine==='brave'){if(p.includes('/images'))return 'images';if(p.includes('/videos'))return 'videos';return 'search';}
 if(engine==='ecosia')return p.startsWith('/images')?'images':'search';
 if(engine==='yahoo')return String(location?.hostname||'').startsWith('images.')?'images':'search';
 if(engine==='startpage'){const sp=new URLSearchParams(String(search||'').replace(/^\?/,''));const c=(sp.get('cat')||sp.get('segment')||'').toLowerCase();if(c.includes('image'))return 'images';if(c.includes('video'))return 'videos';return 'search';}
 if(engine==='qwant'){const sp=new URLSearchParams(String(search||'').replace(/^\?/,''));const t=(sp.get('t')||'').toLowerCase();if(p.includes('/images')||t==='images')return 'images';if(p.includes('/videos')||t==='videos')return 'videos';if(p.includes('/news')||t==='news')return 'news';return 'search';}
 if(engine==='yandex'){const host=String(location?.hostname||'').toLowerCase();if(host.startsWith('images.')||p.startsWith('/images'))return 'images';if(p.startsWith('/video'))return 'videos';return 'search';}
 if(engine==='swisscows'){if(p.includes('/images'))return 'images';if(p.includes('/video'))return 'videos';if(p.includes('/news'))return 'news';return 'search';}
 return 'search';
}
const ECOSYSTEM=/\b(?:artificial intelligence|generative ai|gen ai|chatgpt|openai|anthropic|claude(?: ai)?|gemini(?: ai)?|microsoft copilot|midjourney|stable diffusion|stability ai|dall[ -]?e|adobe firefly|leonardo ai|ideogram|runway(?:ml| ai)?|pika(?: ai)?|suno(?: ai)?|udio(?: ai)?|elevenlabs|kling ai|hailuo ai|luma dream machine|heygen|synthesia|krea ai|recraft ai|dreamina|grok(?: ai)?|perplexity ai|large language models?|llms?|ai agents?|agentic ai)\b/;
const AI_CONTEXT=/\b(?:ai[- ]generated|generated (?:by|with|using) ai|created (?:by|with|using) ai|made (?:by|with|using) ai|synthetic media|ai (?:image|video|art|photo|animation|music|voice|content|tools?|models?|chatbots?|assistant|generator|generators|agents?|technology|research|news|regulation|policy)|machine learning|deep learning)\b/;
const GENERATOR=/\b(?:ai (?:image|art|photo|video|animation|music|song|voice|text) (?:generator|maker|creator|tool)|text[- ]to[- ](?:image|video|speech)|image[- ]to[- ]video|voice clon(?:e|ing)|generate (?:ai )?(?:images?|videos?|art|music|voices?))\b/;
const HUMAN=/\b(?:not ai[- ]generated|not generated (?:by|with|using) ai|human[- ]made|made by (?:a )?human|hand[- ]drawn|traditional animation|original photography)\b/;
function classify({rawTitle='',text='',hrefs='',knownServiceDestination=false}={}){
 const title=n(rawTitle),all=n(`${rawTitle} ${text}`),links=n(hrefs);
 const explicitGenerated=/\b(?:ai[- ]generated|generated (?:by|with|using) ai|created (?:by|with|using) ai|made (?:by|with|using) ai|synthetic media|altered or synthetic content)\b/.test(all);
 const generator=GENERATOR.test(all);
 const ecosystem=ECOSYSTEM.test(title)||ECOSYSTEM.test(all);
 const uppercaseAI=/(^|[^A-Za-z0-9])AI([^A-Za-z0-9]|$)/.test(String(rawTitle||''));
 const boundedAi=AI_CONTEXT.test(title)||(uppercaseAI&&/\b(?:generated|generator|tools?|models?|image|video|art|content|machine|technology|research|news|regulation|policy|agent|chatbot|assistant)\b/.test(title));
 const human=HUMAN.test(all);
 return {explicitGenerated,generator,ecosystem,boundedAi,human,knownServiceDestination:!!knownServiceDestination,links};
}
g.HattonSearchRules=Object.freeze({detectEngine,surface,classify});
})(globalThis);
