# Hatton Shield — Microsoft Edge V1.2.0 BETA

This is the Chromium branch of Hatton Shield, rebased from the **frozen Firefox V1.1.26** filtering/evidence foundation. Firefox V1.1.26 is not modified by this branch.

Hatton Shield is a local-first browser filtering layer designed to reduce detectable AI-generated and AI-promotional content while preserving human-created material where the local evidence does not support hiding it.

## Chromium compatibility repair

- Manifest V3 uses an extension service worker (`background.service_worker`) rather than Firefox `background.scripts`.
- A tiny local compatibility boundary aliases `browser` to `chrome` on Chromium versions that do not expose the browser namespace.
- Background messaging uses the durable `sendResponse` + `return true` pattern so it does not depend on newer promise-returning message-listener behaviour.
- Temporary AI-site allowances use `storage.session` (memory-only) with an in-memory fallback.
- No remote code, cloud classifier, analytics, telemetry, account, or content upload is used.

## Search coverage

Google / Google Images, Bing, DuckDuckGo, Brave Search, Ecosia, Yahoo Search, Startpage, Qwant, Mojeek, Kagi, Yandex, and Swisscows.

New search adapters are deliberately bounded. Search-result layout by itself is never AI evidence; the existing evidence/validation pipeline still has to authorize a hide decision.

## Social/web-feed coverage

YouTube, TikTok, Instagram, Facebook, Threads, X/Twitter, Reddit, LinkedIn, Twitch, Discord Web, Pinterest, Bluesky, selected/recognised Mastodon web surfaces, and Tumblr.

The newer social adapters remain **beta** until live-site testing is completed. On those adapters, ordinary human discussion about AI is not enough by itself to hide a post/message. Strong generation disclosures, bounded phrase/hashtag combinations, generator provenance, or other corroborating evidence are required.

Discord support applies only to **Discord in the browser**. It does not filter the native Discord desktop/mobile apps. Chat/message evidence is processed locally in memory and is not uploaded or retained as browsing/chat history.

## Current limitations

Websites change markup frequently and some AI-generated content exposes no reliable local evidence. The blocker therefore cannot guarantee that every AI item will be detected. Chrome and Edge builds must be live-tested independently even though they share Chromium APIs.

## Sideload for testing

### Microsoft Edge
1. Extract this ZIP to a normal folder.
2. Open `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Disable older Hatton Shield Chromium builds while testing this one.

## Lineage

Firefox V1.1.26 remains the frozen recovery/reference baseline. Chromium V1.2.0 ports that foundation rather than renaming or rewriting its internal runtime contracts.
