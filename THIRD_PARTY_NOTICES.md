# Third-party and AI disclosures

No third-party assets are claimed as entrant-created. No model was trained or fine-tuned by this project. The application loads the following separately hosted components at runtime:

| Component | Provider/source | Version | License / notice |
| --- | --- | --- | --- |
| Three.js, including OrbitControls | three.js authors, https://github.com/mrdoob/three.js | 0.160.1 | MIT; `licenses/THREE-MIT.txt` |
| Transformers.js | Hugging Face / Xenova, https://github.com/huggingface/transformers.js | @xenova/transformers 2.17.2 | Apache-2.0; `licenses/APACHE-2.0.txt` |
| ONNX Runtime Web (via Transformers.js) | Microsoft, https://github.com/microsoft/onnxruntime | dependency of pinned Transformers.js bundle | MIT; `licenses/ONNX-RUNTIME-MIT.txt` |
| all-MiniLM-L6-v2 sentence embedding model | Sentence Transformers contributors, https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 | pretrained model; no retraining | Apache-2.0; `licenses/APACHE-2.0.txt`; source model card documents training/provenance |
| ONNX conversion of all-MiniLM-L6-v2 | Xenova, https://huggingface.co/Xenova/all-MiniLM-L6-v2 | quantized ONNX weights | Apache-2.0; `licenses/APACHE-2.0.txt` |
| DM Sans | Colophon Foundry / DM Sans project authors, https://github.com/google/fonts/tree/main/ofl/dmsans | Google Fonts web distribution | SIL Open Font License 1.1; `licenses/DM-SANS-OFL.txt` |
| Space Grotesk | Florian Karsten / Space Grotesk project authors, https://github.com/google/fonts/tree/main/ofl/spacegrotesk | Google Fonts web distribution | SIL Open Font License 1.1; `licenses/SPACE-GROTESK-OFL.txt` |

CDN/service sources: https://www.jsdelivr.com/ ; https://huggingface.co/ ; https://fonts.google.com/ . Runtime code/model/font hosting availability is an external dependency; no accounts, paid APIs or paid credits are needed by a visitor.

**AI coding assistance:** OpenAI tools assisted with the new application source, tests, UI copy, documentation and review. The entrant is submitting an AI-assisted prototype, not claiming manually authored source or original model training. The app's runtime AI is the disclosed local MiniLM transformer, not the coding assistant.

**Original assets:** All 3D objects are procedural geometry created by this project's scene-building code. No marketplace art, sound, stock images, human likenesses, external user data or video footage is included. The demo video is recorded from the functioning application, with an automated walkthrough clearly labelled.

Apache, MIT and OFL licenses permit commercial use. Font license obligations attach to the fonts, not to the organizer's unrelated software. No copyleft or non-commercial model/library is intentionally used. The dependency license texts are provided for attribution, not as a legal assurance about the organizer's particular downstream use.
