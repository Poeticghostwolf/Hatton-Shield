# Privacy

Hatton Shield processes supported page evidence locally in the browser.

The public beta does not transmit browsing content, filtering decisions, activity records, survivor diagnostics, screenshots, form values, cookies, or page bodies to a remote service. It does not persist a browsing/activity history.

Local extension storage is used only for user configuration such as the enabled state, display preferences, filtering toggles, supported-site toggles, and muted words.

Temporary AI-site allowances are kept in extension-owned in-memory session storage and are not written into website storage.

Firefox data-collection declaration: **none** (no collected data is transmitted outside the extension).

Hashtag, social phrase, and social-card analysis in V1.1.26 is bounded and local. Hashtag text, captions, accessibility/metadata evidence, creator labels, and links used for local filtering are not transmitted or written to browsing-history logs.

V1.1.26 may read TikTok caption, hashtag, creator-label and AIGC disclosure nodes from the bounded enclosing post needed to classify the associated card. This evidence remains in memory only and is not transmitted or persisted as browsing history.

V1.2.0 adds local bounded analysis for Twitch, Discord Web, Pinterest, Bluesky, selected Mastodon web surfaces, and Tumblr when enabled. No raw chat/feed history from those surfaces is persisted or transmitted.
