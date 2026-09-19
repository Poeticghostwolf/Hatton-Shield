(function(g){
'use strict';
// Hatton Shield V1.1.16 — bounded AI-service site registry.
// Exact/first-party AI-service destinations only. This is navigation classification,
// not evidence that arbitrary content on other sites is AI-generated.
const EXACT=new Map([
 ['chatgpt.com','AI assistant'],
 ['claude.ai','AI assistant'],
 ['gemini.google.com','AI assistant'],
 ['copilot.microsoft.com','AI assistant'],
 ['grok.com','AI assistant'],
 ['perplexity.ai','AI search/assistant'],
 ['midjourney.com','AI image generation'],
 ['www.midjourney.com','AI image generation'],
 ['leonardo.ai','AI image generation'],
 ['app.leonardo.ai','AI image generation'],
 ['ideogram.ai','AI image generation'],
 ['runwayml.com','AI video/image generation'],
 ['app.runwayml.com','AI video/image generation'],
 ['pika.art','AI video generation'],
 ['klingai.com','AI video/image generation'],
 ['www.klingai.com','AI video/image generation'],
 ['hailuoai.video','AI video generation'],
 ['lumalabs.ai','AI media generation'],
 ['dream-machine.lumalabs.ai','AI video generation'],
 ['suno.com','AI music generation'],
 ['udio.com','AI music generation'],
 ['elevenlabs.io','AI voice/audio generation'],
 ['heygen.com','AI avatar/video generation'],
 ['app.heygen.com','AI avatar/video generation'],
 ['synthesia.io','AI avatar/video generation'],
 ['app.synthesia.io','AI avatar/video generation'],
 ['krea.ai','AI image/video generation'],
 ['recraft.ai','AI image/design generation'],
 ['dreamina.capcut.com','AI image/video generation']
]);
function host(v){return String(v||'').toLowerCase().replace(/^www\./,'').replace(/\.$/,'')}
function lookupHost(value){
 const raw=String(value||'').toLowerCase().replace(/\.$/,'');
 if(EXACT.has(raw))return {host:raw,category:EXACT.get(raw)};
 const h=host(raw);
 for(const [k,category] of EXACT){const nk=host(k);if(h===nk)return {host:nk,category};}
 return null;
}
function lookupUrl(value){try{const u=new URL(value,location?.href||'https://example.invalid/');return lookupHost(u.hostname)}catch{return null}}
function isKnownAiServiceHost(value){return !!lookupHost(value)}
function isKnownAiServiceUrl(value){return !!lookupUrl(value)}
g.HattonSiteGuardRules=Object.freeze({lookupHost,lookupUrl,isKnownAiServiceHost,isKnownAiServiceUrl});
})(globalThis);
