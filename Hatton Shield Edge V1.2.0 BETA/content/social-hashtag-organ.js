'use strict';
/*
 Hatton Shield Social Hashtag Organ V1.0 (Hatton Shield 1.1.24)
 Bounded, local, deterministic hashtag evidence. No network access.
 Hashtags share one provenance family; repetition never creates independent evidence.
*/
(() => {
  const MAX_TAGS=24;
  const MAX_INPUT=7200;
  const MAX_SIGNATURE=1400;

  const SETS=Object.freeze({
    protective:new Set([
      'noai','notai','antiai','noaigenerated','noaiart','humanmade','madebyhumans','madebyhuman','humanart','humanartist','humanartists','supporthumanartists','handdrawn','handmade','traditionalart','traditionalanimation','traditionalmedia','stopmotion','realphotography','originalphotography','filmphotography','analogphotography','shotonfilm','shotoncamera','paintedbyhand','drawnbyhand','framebyframe'
    ]),
    explicit:new Set([
      'aigenerated','aigeneratedcontent','aigeneratedart','aigeneratedimage','aigeneratedimages','aigeneratedphoto','aigeneratedphotos','aigeneratedphotography','aigeneratedvideo','aigeneratedvideos','aigeneratedmodel','aigeneratedmodels','aigeneratedinfluencer','aigeneratedad','aigeneratedads','aigeneratedcommercial','aigeneratedmusic','aigeneratedsong','aigeneratedvoice','aigeneratedfaces','aicreated','aicreatedcontent','generatedbyai','generatedwithai','generatedusingai','madewithai','madeusingai','madebyai','createdwithai','createdusingai','syntheticmedia','deepfake','deepfakes','aigenerator','aiimagegenerator','aivideogenerator','aiartgenerator','aiphotogenerator','aianimationgenerator','aimusicgenerator','aivoicegenerator','texttoimage','texttovideo','imagetovideo','texttomusic','texttospeech'
    ]),
    media:new Set([
      'aiart','aiartwork','aivideo','aivideos','aiphoto','aiphotos','aiphotography','aianimation','aianimations','aicartoon','aicartoons','aifilm','aifilmmaking','aifilmmaker','aistory','aistories','aidance','aimusic','aisong','aivoice','aiedit','aiedits','aifilter','aiavatar','aiavatars','aicommercial','aiad','aiads','aiproductphotography'
    ]),
    persona:new Set([
      'aimodel','aimodels','aiinfluencer','aiinfluencers','virtualmodel','virtualmodels','virtualinfluencer','virtualinfluencers','aigirl','aigirls','aigirlfriend','aigirlfriends','aiboy','aiboys','aiboyfriend','aiboyfriends','aibaby','aibabies','aibabydance','aicharacter','aicharacters','aipersona','aipersonas','aiwaifu','aiwaifus','aibeauty','aifashion'
    ]),
    tool:new Set([
      'midjourney','midjourneyai','stablediffusion','stablediffusionai','sdxl','adobefirefly','fireflyai','leonardoai','ideogram','runway','runwayml','sora','soraai','sora2','veo','veo2','veo3','veo3ai','veo4','veo4ai','kling','klingai','hailuo','hailuoai','pixverse','lumadreammachine','pika','pikaai','flux','fluxai','dreamina','dreaminaseedance2','recraft','krea','heygen','synthesia','hedra','viggle','seedance','seedance2','higgsfield','higgsfieldai','grokimagine','nanobanana','nanobananapro','dalle','dalle2','dalle3'
    ]),
    promo:new Set([
      'viralai','aiviral','aitrend','aitrending','aipromo','aipromotion','aicreator','aicreators','aicontentcreator','aicontentcreators','aicontentcreation','aiugc','aiugcads'
    ]),
    generic:new Set([
      'ai','artificialintelligence','generativeai','genai','aitools','aitech'
    ])
  });

  function cleanToken(value){
    let s=String(value||'');
    try{s=s.normalize('NFKC')}catch(_e){}
    s=s.toLowerCase().replace(/[\u200b-\u200f\u2060\ufeff]/g,'').replace(/^#+/,'').replace(/_/g,'').replace(/[^a-z0-9]/g,'');
    return s.slice(0,64);
  }
  function pushUnique(out,seen,value){
    const t=cleanToken(value); if(t.length<2||seen.has(t)||out.length>=MAX_TAGS)return;
    seen.add(t);out.push(t);
  }
  function extract(input={}){
    const text=String(input.text||input.hashtags||'').slice(0,MAX_INPUT);
    const hrefs=String(input.hrefs||'').slice(0,MAX_INPUT);
    const out=[],seen=new Set();
    const raw=`${text} ${hrefs}`;
    for(const m of raw.matchAll(/#([a-z0-9_]{2,64})/gi)){pushUnique(out,seen,m[1]);if(out.length>=MAX_TAGS)break;}
    if(out.length<MAX_TAGS){
      const urlPatterns=[
        /\/(?:tag|hashtag)\/([a-z0-9_]{2,64})(?:[/?#\s]|$)/gi,
        /\/explore\/tags\/([a-z0-9_]{2,64})(?:[/?#\s]|$)/gi,
        /[?&](?:hashtag|keywords)=#?([a-z0-9_]{2,64})(?:[&#\s]|$)/gi
      ];
      for(const re of urlPatterns){for(const m of hrefs.matchAll(re)){pushUnique(out,seen,m[1]);if(out.length>=MAX_TAGS)break;}if(out.length>=MAX_TAGS)break;}
    }
    return out;
  }
  function members(tags,set){return tags.filter(t=>set.has(t));}
  function analyze(input={}){
    const tags=extract(input);
    const protectiveTags=members(tags,SETS.protective);
    const explicitTags=members(tags,SETS.explicit);
    const mediaTags=members(tags,SETS.media);
    const personaTags=members(tags,SETS.persona);
    const toolTags=members(tags,SETS.tool);
    const promoTags=members(tags,SETS.promo);
    const genericTags=members(tags,SETS.generic);
    const protective=protectiveTags.length>0;
    const explicitGeneration=explicitTags.length>0;
    const mediaIdentity=mediaTags.length>0;
    const persona=personaTags.length>0;
    const tool=toolTags.length>0;
    const promo=promoTags.length>0;
    const generic=genericTags.length>0;
    // Strong compound means distinct semantic classes, not repeated or case-varied tags.
    // Examples: #ai + #aivideo, #ai + #aibaby, #aiart + #aimodel,
    // two distinct synthetic-persona tags, or media/persona + a known generation tool.
    const compoundStrong=(generic&&(mediaIdentity||persona||tool)) ||
      (mediaIdentity&&persona) || (mediaIdentity&&tool) || (persona&&tool) ||
      ((mediaTags.length+personaTags.length)>=2) ||
      ((mediaIdentity||persona||tool)&&promo);
    return {
      tags:tags.map(t=>`#${t}`),protective,explicitGeneration,mediaIdentity,persona,tool,promo,generic,compoundStrong,
      counts:{explicit:explicitTags.length,media:mediaTags.length,persona:personaTags.length,tool:toolTags.length,promo:promoTags.length,generic:genericTags.length},
      anyPositive:explicitGeneration||mediaIdentity||persona||tool||promo||generic
    };
  }
  function signature(input={}){
    const tags=extract(input);
    return tags.length?tags.sort().join('|').slice(0,MAX_SIGNATURE):'';
  }
  globalThis.HattonHashtagOrganV1=Object.freeze({VERSION:'1.0',MAX_TAGS,extract,analyze,signature});
})();
