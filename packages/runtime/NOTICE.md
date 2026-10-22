# Prototype provenance

Selected geometry, contracts, image-cell sampling, photo transitions and rendering algorithms were extracted from the owner-directed Glyph Studio prototype. The source repository, base commit and exact working-tree input hashes are recorded in the packaged `dist/provenance.json` and repository `docs/inventory.json`.

The port changes packaging to native ESM, removes global registration/source-generation code, makes Wasm URLs explicit, and adds a headless instance facade plus resource expiry/disposal. The original prototype is preserved. Third-party tracking models, MediaPipe, photos, fonts, model providers and Studio/Hermes code are excluded.

No open-source license has been selected. This private alpha package is UNLICENSED and is not published to npm.
