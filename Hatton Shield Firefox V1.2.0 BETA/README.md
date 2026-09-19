# Hatton Shield — Firefox V1.2.0 BETA

Hatton Shield is a local-first browser extension designed to reduce detectable AI-generated, AI-promoted, and AI-focused content on supported web surfaces.

## Current web coverage

Supported browser surfaces include Google/Google Images, Bing, DuckDuckGo, Brave Search, Ecosia, Yahoo Search, YouTube, and TikTok. V1.1.24 added conservative bounded social-card adapters for Instagram, Facebook, Threads, X/Twitter, Reddit, and LinkedIn for live beta testing. Search engines use separate bounded result-card adapters; the presence of an image, cartoon, product, advertisement, or search-result layout is never AI evidence by itself.

## Optional AI-site block mode

V1.1.17 adds an optional local navigation guard for a bounded list of known AI-first services. When enabled, a known AI-service site is paused with a local Hatton Shield interstitial offering **Go back** or **Allow for this tab**. The temporary allowance is tab/session scoped and is not a browsing-history log.

The optional AI-site block mode does not claim that every page discussing AI is AI-generated, and it does not block ordinary news, documentation, art, photography, shops, or animation merely because they mention AI-related subjects.

## Beta limitations

Detection is not perfect. Sites change markup frequently, some AI media exposes no reliable local evidence, and false positives remain possible. Native mobile apps are outside the scope of this browser extension; supported services must be used inside a compatible browser.

No analytics, telemetry, remote classifier, account, or cloud upload is used by the extension.


### V1.1.17 UI/guard repair
- Removed pre-evaluation blur that could wash out Bing/result sections.
- Tightened Bing discovery to bounded result-card selectors.
- AI-service blocking is now opt-in and off by default; ChatGPT and similar services remain usable unless the user enables it.



### V1.1.19 performance / I/O repair
- Caches extension configuration in the page instead of reading extension storage on every scan.
- Deduplicates delayed refresh timers for recycled/dynamically hydrated cards.
- Bounds mutation-subtree traversal and routine scan queues.
- Uses a single mutation pipeline for detection and viewport candidate discovery.
- Avoids rescoring unchanged cards just because they leave and re-enter the viewport.
- Releases expensive blur/backdrop compositor work for blocked cards well outside the viewport, restoring the normal treatment before they approach view.
- Detection thresholds and evidence rules remain unchanged from V1.1.18.

### V1.1.18 TikTok hashtag precision
- Prioritizes bounded TikTok hashtag evidence, including hashtags recovered from `/tag/...` links.
- Strong explicit generation hashtags can trigger a decision; generic `#ai` alone cannot.
- Known generation-tool hashtags are high-confidence evidence. AI-model/influencer/photo/video/promotional hashtags remain medium evidence unless a compound AI-media signature or independent non-hashtag evidence corroborates them.
- All hashtag positives share one provenance group so hashtag piles cannot self-amplify.
- `#noai`, `#antiai`, human-made, traditional-art/animation and real-photography tags protect against hashtag-only false positives.
- Shop, photo, cartoon, animation, sponsored and product-card structure remains non-evidence by itself.


### V1.1.21 Google Images lazy-metadata repair

- Resolves bounded Google Images cards before hover even when Google keeps the destination overlay dormant.
- Reads only bounded card-local text/ARIA/data metadata already present in the DOM; no visual guessing or remote lookup is added.
- Uses `textContent` in the deep Google Images evidence pass so dormant captions can be evaluated without forcing layout through repeated `innerText` reads.
- Keeps fail-open behaviour when Google genuinely provides no reliable AI evidence before interaction.

### V1.1.20 Firefox public-release security hardening
- Removes internal decision scores, traces, and authorization states from host-page `data-*` attributes.
- Moves temporary AI-site allowances out of website `sessionStorage` into extension-owned session state.
- Declares no transmitted data collection for Firefox/AMO metadata.
- Adds Firefox for Android availability metadata while retaining the same Firefox runtime rules.
- Strips editor/timestamp metadata from packaged icons.


## V1.1.22 Google Images viewport repair
Google Images masonry tiles are now evaluated as they approach the viewport, including tiles whose wrapper does not match the generic article/list card selectors. This removes reliance on hover-triggered metadata mutations for discovery while preserving fail-open evidence rules.


## V1.1.23 performance / flicker repair

This Firefox build keeps the V1.1.22 detection/evidence policy while reducing scroll-time work on dynamic video feeds. It uses a lightweight lifecycle fingerprint before classification, keeps only one delayed hydration timer alive per virtual card, avoids generic descendant walks on YouTube/TikTok, bounds social scan batches, and uses compositor-safe video placeholders instead of live Gaussian blur surfaces. Google Images retains the V1.1.22 viewport-discovery repair.


## V1.1.24 social survivor closure

- Adds a dedicated bounded Social Hashtag Organ shared across supported social adapters.
- Expands explicit-generation, AI-media, synthetic-persona, generator-tool, promotion, generic-AI and human/protective hashtag vocabularies.
- Deduplicates case/duplicate variants (`#AI`, `#ai`) and caps hashtag collection at 24 unique tags per card.
- Adds compound signatures such as `#ai + #aivideo`, `#ai + #aibaby`, persona clusters, and media/persona + generator-tool combinations without treating ordinary `#influencer`, `#model`, `#girl`, `#baby`, `#art`, or `#video` as AI evidence.
- Patches late hashtag hydration by including a bounded hashtag signature in the lifecycle fingerprint; newly inserted `/tag/`, `/hashtag/`, and `/explore/tags/` links force re-evaluation without restoring full-page rescans.
- Keeps all hashtag-derived positive evidence in one provenance group so tag stuffing cannot manufacture independent corroboration.
- Extends the compositor-safe social placeholder treatment to the new social beta surfaces to preserve the V1.1.23 flicker/I/O repair.
- Adds regression fixtures for the observed TikTok survivor patterns, duplicates/case variants, protective tags, late hydration, unrelated `ai...` words, and newly researched generator/persona tags.

The new Instagram/Facebook/Threads/X/Reddit/LinkedIn adapters are deliberately conservative and should be treated as beta until live-site testing is complete. No visual-style guessing or remote classifier was added.


## V1.1.25 social phrase / metadata closure

- Adds a bounded Social AI Phrase Organ shared by YouTube, TikTok, Instagram, Facebook, Threads, X/Twitter, Reddit, and LinkedIn card adapters.
- Applies the researched AI-generation, media, synthetic-persona, generator-tool, generic-topic, promotion, and human/protective families to ordinary text and metadata even when no `#` symbol is present.
- Keeps plain discussion conservative: a lone generic AI topic, tool name, `AI model`, `AI influencer`, or similar phrase is not enough by itself on the newer social adapters. Explicit generation wording, tool+creation wording, or corroborated media/persona/tool combinations can authorize filtering.
- Removes hashtag tokens before phrase analysis, so one hashtag cannot be counted twice through two evidence organs.
- Adds source-aware creator/accessibility/metadata handling and a phrase signature to the lifecycle fingerprint, so late `aria-label`, caption, creator, disclosure, generator, or related metadata hydration can trigger re-evaluation without restoring full-page rescans.
- Adds bounded metadata keys for AI/content labels and generator provenance where exposed by a supported page.
- Extends human-made/no-AI protection across the shared social phrase path; it reduces weak phrase/hashtag evidence but never overrides explicit AI-generation disclosures.
- Preserves the V1.1.23 compositor-safe video placeholders and low-I/O scheduling architecture.


## V1.1.26 TikTok canonical evidence / Warden closure

- Fixes a runtime gap where large TikTok video/feed cards could be rejected by the generic target-geometry safety boundary before the social evidence organs reached a usable hide target.
- Keeps the generic boundary unchanged for ordinary websites. TikTok receives a separate bounded media-target contract with strict width, height, area, media-presence and video-identity limits.
- The GAIA/Warden independently recomputes the TikTok target contract before authorizing DOM modification; the detector cannot self-authorize a larger target.
- Reads TikTok caption/hashtag evidence from a bounded enclosing post scope while preserving the smaller media/card node as the action target.
- Adds explicit local handling for `data-e2e="video-desc"`, `data-e2e="browse-video-desc"` and TikTok AIGC label nodes.
- Caption, hashtag and AIGC sibling hydration now trigger a bounded refresh of the associated TikTok card.
- Browser-level regression fixtures cover AI-girlfriend/model/baby hashtag clusters, plain phrase evidence, AIGC labels, late hashtag hydration, and a human-made control case.
- No remote classifier, visual-style guessing, page-wide polling, or network upload was added.

## V1.2.0 expanded Firefox coverage

Firefox V1.1.26 remains the frozen recovery baseline. V1.2.0 carries that evidence/security foundation forward while adding conservative bounded adapters for Twitch, Discord Web, Pinterest, Bluesky, selected Mastodon web surfaces, and Tumblr. Search coverage also adds Startpage, Qwant, Mojeek, Kagi, Yandex, and Swisscows.

These new surfaces reuse the same local hashtag/phrase/provenance evidence paths and compositor-safe social placeholders. Ordinary social content, photos, art, models, fruit, babies, creators, products, or videos are not AI evidence by themselves. The new adapters remain beta until live Firefox testing confirms their current DOM structures.
