# Verification record

Date: 11 November 2026, within the conservative official build period ending 14:00 UTC.

## Passed

- Node test suite: 6 tests pass, covering scene counts/colors/timers, switch/explore overrides, distinct collection accounting, gate unlocking, explicit completion, timer expiration, reset, bounds, unsupported object IDs and similarity ranking.
- JavaScript syntax checks on app.js and canvas-renderer.js.
- Browser-local actual MiniLM download and inference in Chrome: default forest prompt selected forest 0.62, castle 0.43, space 0.25; live scene generated five crystals and three rules.
- Live browser flow: a locked gate rejected early exit; interacting twice with one crystal did not double count; collecting all five opened the gate; entering the gate completed the level; restart reset the score and gate.
- Alternate natural-language underwater/switch prompt selected ocean 0.54 and compiled four switches after correcting a plural-parsing bug. Regression test added.
- Real 3D Canvas fallback rendered the procedural scene when the verification browser lacked WebGL. Camera and scene use Three.js transforms and perspective projection.

## Still to verify before final submission

- Hosted public demo and source accessibility.
- Final uploaded video duration/playback.
- Additional alternate prompts, switch gameplay and timed/exploration flows in the browser.

## Verification limitations

- This browser does not provide a WebGL context, so the GPU renderer has not been exercised here. The CPU fallback has been exercised.
- No comprehensive mobile-device, Safari/Firefox, offline-first or adversarial/security assessment has been performed.
- Automated unit tests use synthetic semantic rankings to isolate compiler/state behavior. Actual model inference is checked separately in the browser; unit tests do not claim to validate model quality.
