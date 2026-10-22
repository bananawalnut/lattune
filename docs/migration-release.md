# Migration and release gates

## Preserve the prototype

Glyph Studio remains a live reference repository. Its current dirty tree includes multiple conversations' work. Do not reset it, commit all changes, move private runtime stores, stop existing servers or mass-copy it to this public repository.

P0 produces an allowlisted inventory: source file, originating commit or working-tree hash, owner/provenance, license, public dependencies, feature classification, fixture and migration destination. Review uncommitted files individually. Keep local evidence containing user paths outside the public repo. Record algorithm-level compatibility fixtures before extraction. A snapshot containing private resources stays private.

Public migration excludes `.runtime`, Hermes homes, bearer/connection files, model weights, uploaded photos/audio/video, local absolute paths, generated user presets and research datasets without explicit redistribution rights. Recreate examples from synthetic/publicly licensed fixtures. Keep third-party attribution with migrated code.

## Incremental route

1. Inventory and freeze representative behavior/contract fixtures; agree supported APIs and licenses.
2. Extract deterministic contracts/state/geometry without changing behavior. Add real ESM entries and declarations.
3. Build renderer and element adapters with explicit registration/lifecycle. Prove tarball installs in clean consumers before building a new editor around them.
4. Port a single image-surface vertical slice: stable cells, native controls, local resource receipt, target state and visual settlement. Measure it on declared devices.
5. Extract compiler and portable manifests; implement source-safe import/upgrade plus recoverable workspace writes.
6. Build the new project-centric Studio against public authoring APIs; connect Hermes and MCP through the same service.
7. Add curated presets and optional flow beta. Keep legacy import compatibility behind an explicit converter with source-version errors.
8. Release beta after all supported gates; stabilize only after real consumer feedback and measured compatibility.

The first private-alpha runtime now has real packed-consumer imports; see [extraction evidence](runtime-extraction.md). This does not complete the full production gates. The Studio concept remains a design artifact.

## Required evidence before release

| Gate | Required proof | Responsible role |
|---|---|---|
| Distribution | `npm pack` artifacts installed in clean vanilla, Vite and SSR projects without checkout aliases, globals or Studio | Library/release |
| Types and imports | Published declarations compile; server imports touch no DOM/GPU; explicit elements registration; dependency graph excludes compiler/Node/agent from runtime | Library |
| Lifecycle | 100 mount/update/unmount cycles, context loss/recovery, hidden tab sleep, pause/resume, reduced motion, disposal of owned listeners/resources/workers/GPU objects | Runtime/QA |
| Contracts | Human/agent/peer parity, validation failures, stale revisions/incarnations, deterministic sampling, declared commit policies and cancellation before/after commit | Runtime/QA |
| Images | Size/decode limits, malformed/expired resources, UV/stable-cell behavior, interruption replacement, target RGB and final displayed colors under reduced motion | Runtime/QA |
| Accessibility | Native controls/content, keyboard/focus, screen-reader review and fallback content; canvas metadata alone is insufficient | Product/QA |
| Performance | Fixed workloads/devices/browser versions, payloads, startup, p95 frame intervals, memory/allocations, uploads and offscreen behavior | Runtime/QA |
| Source import | Plan/apply exact hashes, local edits preserved, three-way upgrade conflicts, traversal/symlink escapes denied, no implicit package-manager/lifecycle execution, provenance | Authoring |
| Recovery | Kill during save/import, restart old/new valid state, identical retry dedupe, stale proposal preservation, corrupt metadata recovery | Service/QA |
| Authority | From P3: receiving service rejects unauthorized HTTP, roots/resource IDs, expired grants and adapter bypass; preview rejects forged/stale worker messages, denies network/filesystem/provider access and terminates hung code | Service/security |
| Hermes | Fresh install/update/rollback/uninstall preserve unrelated profile/provider/files; compatibility negotiation and doctor | Integration |
| Adapter parity | CLI/UI/Hermes/MCP produce matching revisions, schemas, errors and receipt meaning | Integration |
| Supply chain | No private assets/secrets/paths; license decision, third-party notices, dependency inventory/SBOM, release artifact checks | Release |
| Docs/support | Five-minute integration, API/contracts, migration guide, compatibility matrix, changelog/security/support policy | Product/release |

Browser support targets Chromium, Firefox and Safari on declared supported versions plus actual desktop/mobile devices. Pin the release matrix after P0. Do not infer a mobile or Safari guarantee from Chromium-only evidence.

## Initial performance targets

Proposed basic-scene gate: **<=15 KB gzip** for the smallest renderer-enabled import, with no author/compiler/agent/capture dependency. Report font/texture/asset cost separately and include it in full-page measurements. A build with both WebGL2 and Canvas fallback is measured as that combined configuration; it cannot inherit a single-renderer budget without evidence. Every optional entry declares a separate budget. Review growth >10% against a pinned baseline; do not silently raise the budget.

Set CPU/GPU/frame/startup/memory thresholds from representative device measurements in P2. Existing CPU geometry/submission measurements are not end-to-end FPS evidence. Rust/Wasm stays optional only where crossings and workloads show a benefit; WebGL2/GLSL handle appropriate rendering work. Do not move everything to Wasm merely because it is lower level.

## Release mechanics

Use explicit ESM exports, declarations, distributable file allowlists, side-effect boundaries and compatibility versions. Verify packed artifacts rather than source-checkout imports. CI runs consumer tests, dependency/size budgets, contract/lifecycle tests, browser matrix, and asset/secret scans on exact artifact hashes.

Semver covers public contracts, saved formats and compiler/runtime compatibility. Breaking stored formats need fixtures, backups and an explicit migration path. Document support windows, prerelease channels and rollback policy before stable publication.

Produce provenance-bound releases using npm's documented [provenance workflow](https://docs.npmjs.com/generating-provenance-statements/) where supported, alongside source tags, changelog, notices and an artifact inventory. Publishing credentials/organization ownership and the license require explicit setup; this initial public repository is not publication approval.
