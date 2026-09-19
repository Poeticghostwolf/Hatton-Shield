'use strict';
/* Hatton Shield Chromium compatibility boundary.
   Chrome <148 exposes chrome.* only; Chrome 148+ may also expose browser.*.
   Edge follows Chromium extension APIs. Keep a single local alias and no polyfill/network code. */
(() => {
  if (!globalThis.browser && globalThis.chrome) globalThis.browser = globalThis.chrome;
})();
