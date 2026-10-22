# Working in Lattune

- Never use the Sites skill or Sites plugin. Use this repository and normal development tools.
- This repository contains a working private-alpha runtime plus a productionization plan and scripted Studio concept. Read packages/runtime/README.md for the implemented API; do not present the broader proposal, model mocks or adapters as implemented.
- Read docs/production-blueprint.md and docs/migration-release.md before implementation. Work one release gate at a time.
- The sibling Glyph Studio repository is a live, dirty prototype shared with other work. Do not reset it, stage all its changes, stop its servers, or publish its private data. Port small reviewed units with provenance and fixtures.
- Keep runtime core headless and independent of browser globals, Studio, Node services, model providers, and compiler dependencies. Enforce architecture.json against built artifacts when packages exist.
- Programmer-defined contracts are canonical. Agent schemas and UI forms project those contracts rather than maintain competing definitions.
- Separate committed domain results, settled presentation, and durable artifact receipts. Cancelling animation does not roll back committed state.
- Keep photo/audio bytes, models, runtime databases, credentials, connection files, absolute user paths, and Hermes homes out of git, prompts, packages, and presets by default.
- Designer output is a revision-bound proposal. Compile, execute isolated preview, and contract-test exact artifact hashes before claiming those checks passed. Saving and publishing are distinct.
- Do not silently overwrite edited component source or modify model/provider settings. Record source provenance and explicit upgrade conflicts.
- Run build:runtime, test:runtime, test:consumers and check for runtime changes. Consumer tests install packed archives into clean projects; never substitute path aliases or workspace links. Do not use mocks to claim production readiness.
