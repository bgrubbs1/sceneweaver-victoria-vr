# Verification record

Date: 11 November 2026, within the conservative official build period ending 14:00 UTC.

## Passed

- Node test suite: 8 tests pass, covering scene counts/colors/timers, switch/explore overrides, distinct collection accounting, gate unlocking, explicit completion, timer expiration, reset, bounds, unsupported object IDs similarity ranking, explicit collection overrides, all supported color modifiers, combined adjectives, and the word eleven.
- JavaScript syntax checks on app.js and canvas-renderer.js.
- Browser-local actual MiniLM download and inference in Chrome: default forest prompt selected forest 0.62, castle 0.43, space 0.25; live scene generated five crystals and three rules.
- Live browser flow: a locked gate rejected early exit; interacting twice with one crystal did not double count; collecting all five opened the gate; entering the gate completed the level; restart reset the score and gate.
- Alternate natural-language underwater/switch prompt selected ocean 0.54 and compiled four switches after correcting a plural-parsing bug. Regression test added.
- Real 3D Canvas fallback rendered the procedural scene when the verification browser lacked WebGL. Camera and scene use Three.js transforms and perspective projection.

- Independent reviewer browser test: an unfamiliar cyberpunk/two-red-switch prompt selected the city theme, generated two switches, kept the gate locked after one, unlocked after two, completed on gate interaction, and reset to zero.
- Pinned model revision `751bff37182d3f1213fa05d7196b954e230abad9` loaded and ran successfully in Chrome. A laboratory/one-crystal/10-second-timer prompt selected lab and generated the requested collection game. Timer expiration blocked interaction; reset restored it, collection plus gate interaction completed it before expiry.
- Recorded video: H.264, 1280×720, 30 fps, 39.966667 seconds, 266257 bytes. Full decode check passed and multiple frames were visually inspected by builder and independent reviewer. SHA-256: `a349d415feff353a40f92ce76bc49d8b07376c78030a46faf0aff8e1ced8fa60`. The actual automatically played scene and rules are labelled, not represented as manual play.

- Exploration prompt selected desert, generated five inspectable objects with one non-collection rule, and clicking an object showed its inspection. JSON panel and export were exercised.

## Public release checks

- The public repository, hosted application, and demo video were independently opened without login. URLs: https://github.com/bgrubbs1/sceneweaver-victoria-vr ; https://bgrubbs1.github.io/sceneweaver-victoria-vr/ ; https://bgrubbs1.github.io/sceneweaver-victoria-vr/demo.html .
- Hosted app.js, planner.js, and demo.mp4 matched release bytes before the final count-parser correction. Final hosted parser verification follows that correction.
- Independent hosted real-model prompt selected Neon district (city 0.47); collection, locked/unlocked gate and explicit completion worked. The test revealed that purple modifiers blocked count parsing. All nine supported color modifiers, combined adjectives, singular switches, and the word eleven now have regression coverage.
- The public video played in Chrome with no error, readyState 4, duration 39.966667 seconds, 1280×720. Its SHA-256 matched the tested local video.


## Verification limitations

- This browser does not provide a WebGL context, so the GPU renderer has not been exercised here. The CPU fallback has been exercised.
- No comprehensive mobile-device, Safari/Firefox, offline-first or adversarial/security assessment has been performed.
- Automated unit tests use synthetic semantic rankings to isolate compiler/state behavior. Actual model inference is checked separately in the browser; unit tests do not claim to validate model quality.
