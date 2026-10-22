# Roundtable record

2026-10-22. Three independent repository-informed reviews, followed by cross-challenge and a final architecture critique. Participants are review roles, not invented outside experts.

| Review role | Main finding | Challenge resolved |
|---|---|---|
| Library architecture | Strong internals, missing ESM/type/distribution boundaries | Keep three packages, test subpath graph and clean tarballs; narrow v1 to three complete journeys |
| Agent and integration | Shared authoring kernel exists, but durable source/imports and receiver-side authority are incomplete | Compiler belongs to author; Node orchestration to agent/node; Hermes/MCP stay thin |
| Product direction | Prototype exposes its development history as many competing workshops | Library is the product; one project-centric component workspace replaces parallel workshops |

## Decisions and disagreements

1. **Redo the product, preserve algorithms.** A simultaneous rewrite of geometry, contracts, transport, editor and capture would discard evidence. Extract reviewed units behind new public boundaries.
2. **Three packages, not twelve.** Runtime uses explicit optional subpaths; author owns compilation; agent owns the semantic registry and Node orchestration. Studio and plugin ship separately.
3. **No new DSL for v1.** TypeScript, runtime contracts and raw mathematical callbacks remain the base. An optional analyzable compute graph is later work, not a promise that arbitrary TypeScript becomes GLSL/Wasm.
4. **MCP is an adapter.** A typed domain registry is canonical; native Hermes, MCP, CLI and UI project it. Small role toolsets do not replace server authorization.
5. **Committed and settled are different.** The prototype's flow commits at arrival while photo receipt commits a target before animation finishes. New methods declare their policy. Saving artifacts has its own durable receipt.
6. **Copyable source and package imports are both useful.** Support both explicitly with provenance and conflict-aware upgrades. Edited source cannot be silently refreshed from upstream.
7. **Atomic design is metadata.** Image surfaces can be molecules in a design system without forcing every component into a global hierarchy.
8. **Flow is optional beta.** The first production promise is integration, photo/data interaction and authoring/import. Elaborate routing is not a prerequisite for the small library.
9. **Capture and animals are labs.** Preserve research without expanding core support and hardware requirements.
10. **Lattune replaces the initial naming preference.** Cellweave was the product reviewer's first choice, but screening found an existing single-cell platform/package. Syntopa and Tessora also have clear software/business collisions. Lattune passed the limited exact-name screen below.

## Naming screen

Chosen working brand: **Lattune** (lattice + attune). Product names: Lattune, Lattune Studio, Lattune Designer. The library describes programmable geometry and responsive interactions, with ASCII as one visual vocabulary.

Checked 2026-10-22: GitHub repository search `lattune in:name` returned zero; GitHub's exact `bananawalnut/lattune` lookup returned 404 before creation; npm registry GET `/lattune` returned 404. General exact-name search showed no clear software result in the checked results. These checks are narrow, time-bound evidence. They do not reserve the npm scope, a domain, or trademark rights. `@lattune/*` remains a proposed scope until secured.

## Evidence inspected

Glyph Studio v0.20.0 package metadata, TypeScript alias, global-script language/runtime instructions, build-player concatenation, authoring service, component interface/discovery, Hermes installer/plugin schemas, image transition semantics, test scripts and current working tree. The tree includes unpublished concurrent work; no bulk snapshot was published.

## Open decisions

- License and third-party notices before code migration or package publication.
- npm scope ownership; package names are provisional.
- Minimum Node/browser support from clean-consumer and device measurements, not assumed from the prototype's Node >=18 field.
- First supported host framework beyond native elements/vanilla/Vite/SSR smoke fixtures.
- Storage engine after durable write/recovery semantics are specified.
- Whether optional flow reaches stable in v1 or stays beta; core is not blocked on it.

These are release checkpoints, not reasons to stop preparing a concrete repository and plan.

## Final artifact review

Both architecture and integration reviewers read the drafted blueprint/API/roadmap. Incorporated corrections: browser-safe author vocabulary versus Node compiler entries; headless flow versus DOM adapter; authorization with the first P3 writes; explicit immutable version saves; import path/symlink revalidation and no implicit package execution; preview forgery/timeout tests; finite portable state, stable sampling and resource grants; separately measured Canvas fallback. No reviewer treated the concept as an implemented library.
