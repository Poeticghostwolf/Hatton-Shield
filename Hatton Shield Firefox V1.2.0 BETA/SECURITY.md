# Security

If you discover a security issue in Hatton Shield, avoid publishing exploit details until the issue can be investigated and fixed.

The public beta contains no remote executable code or cloud classifier and is designed to operate locally in the browser.

Internal decision scores and authorization traces are kept out of host-page DOM attributes in the public Firefox build.

V1.1.24 caps social hashtag collection and keeps hashtag evidence in one provenance group so duplicate/tag-stuffed inputs cannot create artificial independent corroboration. V1.1.25 adds a separate bounded non-hashtag phrase provenance group, strips hashtags before phrase analysis, and fingerprints late phrase/metadata hydration without adding remote classification or page-wide rescans.

V1.1.26 keeps the generic Warden geometry boundary intact and adds an independently validated TikTok-only bounded media-target exception. The Warden rechecks host, dimensions, area, media presence and video-link cardinality before permitting modification; content classification cannot bypass this authorization step.

V1.2.0 retains Firefox's native extension runtime path and does not import the Chromium compatibility shim or service-worker message adapter. New social/search adapters remain inside the existing evidence → trust → GAIA/Warden → DOM-action separation.
