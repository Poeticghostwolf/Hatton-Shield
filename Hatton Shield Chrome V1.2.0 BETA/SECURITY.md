# Security

Hatton Shield uses packaged local code only and contains no remotely hosted executable code. The Chromium branch preserves separation between evidence collection, decision fusion, trust/authorization, GAIA/Warden action validation, and DOM modification.

Public/development packages must be scanned for credentials, private keys, local machine paths, debug endpoints, nested executables, dynamic code execution, and unexpected network primitives before release.

The Chromium service worker uses a compatibility-safe asynchronous message-response pattern and stores temporary site allowances in extension-owned session memory rather than website storage.
