# SceneWeaver

**Words into small, playable 3D worlds.** A bounded browser-local AI Builder prototype for the Victoria VR AI Builder Hackathon 2026, team Grubbs.

## What actually works

- Type a short scene description. A real quantized **all-MiniLM-L6-v2** transformer runs in your browser through Transformers.js/ONNX Runtime.
- Mean-pooled normalized embeddings and cosine similarity choose among **7 themes** (space, forest, ocean, desert, city, castle, lab) and **3 mechanics** (collect, switches, explore).
- An explicit parser extracts supported quantities, colors and optional time limits. A deterministic compiler produces a JSON scene and safe event-condition-action rules.
- The browser renders real procedural 3D geometry with Three.js. WebGL is preferred; a small Canvas2D perspective renderer projects the same 3D scene graph when WebGL is unavailable.
- Click crystals or switches, unlock the gate, finish the level, and restart. Optional timers can expire. Keyboard-accessible controls mirror 3D object actions.
- Inspect the rules and semantic similarity rankings. Export the JSON plan. Record an explicitly labelled automated walkthrough of the actual scene and rules.

## Try these prompts

1. `An enchanted forest with five glowing crystals. Collect them all to open a magical gate.`
2. `A moon base with three blue crystals. Collect them to unlock the airlock. Add a 45 second timer.`
3. `An underwater coral reef with four switches. Activate all of them to open the exit gate.`
4. `A peaceful desert temple diorama with five golden orbs. No puzzle, just explore.`

Click **Build with local AI**. The first build downloads a roughly 23 MB quantized model plus the inference engine. Wait for the live-inference badge. The initial forest is a clearly labelled hand-authored example, not claimed as AI output.

## Deliberate limits

This is **not** an LLM, a general text-to-3D mesh generator, arbitrary game-code generation, or a full game engine. It composes a small vocabulary of procedural worlds and validated rules. Unrelated prompts will be mapped to a supported theme, not fulfilled literally. Similarity values are cosine scores, not calibrated probabilities. Counts are bounded to 1–12 and timers to 10–300 seconds. English is the supported input language. The model may truncate long text at its token limit.

Rendering uses an orbit camera rather than first-person navigation. There is no physics engine, multiplayer, persistent user storage or backend. The CPU renderer uses painter's ordering and can show minor occlusion artifacts. No headset is needed or claimed. Mobile layout exists but comprehensive mobile hardware testing has not been performed.

## Run locally

Requires a modern browser and an HTTP static server, with internet access for the pinned library files and model download:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. No package installation, build pipeline, API key or paid service is required. Node 18+ is needed only for tests/build-copy:

```sh
npm test
npm run build
```

`dist/` is the hand-authored/AI-assisted application source. `docs/` is an exact publication copy for GitHub Pages. `scripts/build.mjs` performs the copy. Tests cover the pure compiler and game-state transitions. See `VERIFICATION.md` for actual browser checks and gaps, rather than assuming all features were tested on every platform.

## Architecture and privacy

`app.js` loads the model, performs inference, builds the Three.js scene, wires interaction and export, and records actual canvas frames. `planner.js` is the independently testable scene compiler/state machine. `canvas-renderer.js` is a CPU fallback renderer. The app never evaluates model-generated JavaScript, accepts credentials, or sends prompt text to a remote inference endpoint.

External requests fetch code, fonts and model assets from jsDelivr, Google Fonts and Hugging Face. Those hosts receive ordinary network request metadata. The application has no analytics and no prompt-upload endpoint. A model/network failure shows an error and preserves the existing scene; it is not silently replaced by a fake AI response.

## Authorship, AI and licenses

The project was implemented with **OpenAI AI coding assistance at the entrant's direction during the hackathon build period**. Generated source was inspected and tested; no claim of manual-only authorship is made. No proprietary Victoria VR code, third-party demo project, downloaded artwork, paid assets or training dataset is included. All world geometry is procedural.

Third-party model, library, runtime and font sources and licenses are disclosed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Required upstream license texts are in `licenses/`. The original project code is not relicensed under a third-party dependency's license; see `LICENSE` for its status and the organizer's submission terms.

No claims are made about prizes, judge acceptance, regulatory compliance, production readiness or broad prompt fidelity.
