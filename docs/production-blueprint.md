# Production blueprint

Decision date: 2026-10-22. Status: proposed implementation plan, accepted direction for this repository foundation.

## Product decision

Lattune is a programmable interaction library with a local authoring studio. A component combines typed inputs/state/methods, geometry, cell appearance, semantics, and presentation. The same method can be invoked by a native form, an agent, or another component. Studio edits real project source; Hermes and MCP adapt the same authoring service.

The redesign changes product boundaries and workflow. It does not discard tested geometry and contract implementations merely to rename them. The old Glyph Studio stays intact as a reference while reviewed internals migrate incrementally.

## What exists versus what is missing

The inspected Glyph Studio prototype is private v0.20.0. It already contains deterministic sampling, Rust/Wasm geometry experiments, WebGL2/Canvas renderers, pure component state handlers, runtime contracts, page discovery, image color receipt/transitions, TypeScript compilation, isolated preview, and shared authoring operations. Its working tree also includes concurrent unpublished face research.

It is not currently a package-consumer product: no public exports/declaration contract, local `@glyph/author` path alias, browser global load-order dependencies, mixed authored/generated output, multiple workshops, and no clean project import/upgrade workflow. Current browser receipts and jobs do not imply durable authoring recovery. An adapter tool allowlist is not receiving-service authorization.

Historical observed gzip sizes include approximately 11.5 KB player, 1.6 KB geometry Wasm, 20.2 KB flow, and 8.6 KB image module. These are evidence from the prototype, not guarantees for this redesign and not complete page costs.

## Three v1 journeys

1. **Integrate:** install a packed runtime in a clean coding project; import one preset, mount it with native controls and accessible content; update props and dispose it. It works without Studio or browser global script ordering.
2. **Interact:** discover a component's declared method; send a local photo resource; commit target cell colors and observe a deterministic transition. A person, agent, and peer use the same contract. Reduced motion reaches the same final state.
3. **Author:** open project source; prompt or dictate an edit; inspect the source diff; compile; run isolated preview and contract tests; save an immutable version; plan and apply a source import into another project without overwriting local edits.

Flow routing is an optional beta until arrival/commit policy and framework behavior are tested. A polished flow demo must not hold the core library release hostage.

## v1 scope and labs

Supported target scope: props/state/method schemas; deterministic surface/path/composite sampling; raw math callbacks; glyph/point rendering; stable cell IDs/UVs; image color receipt/reset/transitions; local discovery/invocation; explicit native Web Component registration; lifecycle and accessibility; compiler/CLI; project source imports; local Studio; thin Hermes/MCP adapters.

Curated recipes: shell + signal, word field, category cluster, ribbon, image surface. A preset is parameters or editable source over the same component format. Atoms/molecules/organisms are optional descriptive metadata, never mandatory inheritance or folder structure.

Labs remain opt-in: face reconstruction/tracking, animal biomechanics, arbitrary shader/Wasm programming, automatic TypeScript-to-GPU compilation, remote collaboration, hosted public registry. Keep their fixtures and research separate. Do not imply a photo texture is a reconstructed volumetric scan.

## Architecture

Start with three versioned packages in one repository, plus Studio and the native plugin. Avoid creating a dozen independent release trains before there are consumers.

| Unit | Owns | Must exclude |
|---|---|---|
| runtime/core | Component contracts, deterministic state/clock, addresses, invocation results | DOM evaluation, GPU setup, Node, compiler, providers |
| runtime/geometry | Surfaces, paths, composites, transforms, typed sampled frames | Renderer registration and browser globals |
| runtime/renderers/* | Explicit WebGL2 and Canvas adapters, lifecycle | Studio, authoring, agent code |
| runtime/image | Resource interfaces, UV/color sampling, receive transitions | Implicit fetch, private asset persistence |
| runtime/elements | Explicit custom-element registration and DOM adapters | Import-time registration |
| runtime/flow | Headless optional routing/delivery and commit policy | DOM measurement and distributed durability claims |
| runtime/elements/flow | Optional DOM targets and obstacle measurement over headless flow | Import-time DOM work |
| runtime/presets/* | Individually importable curated definitions | Eager loading all examples/assets |
| author/vocabulary | Browser-safe TypeScript vocabulary/types | Compiler, Node and model SDKs |
| author/node | Compiler, diagnostics, CLI, manifests/provenance | Browser client graphs and generated application output |
| agent | Operation registry, typed clients and adapter projections | Node/service code in browser entry |
| agent/node | Authorization, jobs, revisioned workspace orchestration and durable writes through author | Duplicated compiler/contracts |
| apps/studio | Project UX, editor, preview, inspection, Designer UI | Sole authoritative copy of user source |
| plugins/hermes | Generated schemas/client, tools, skill/profile, managed installation | Parallel storage/compiler/business logic |

`architecture.json` specifies the intended dependency graph. Explicit exports, conditional entries, and clean consumer tests enforce it. Node's [package entry-point documentation](https://nodejs.org/api/packages.html) provides the package mechanism; an exports map alone cannot prove dependency isolation.

## Component and math model

Separate immutable definitions, live instances, sampled geometry, resources, and presentation. Definitions own programmer-designed methods, not a mandatory universal `add` or `receivePhoto`. Reusable capabilities can supply those methods when appropriate.

Geometry maps parameters/time/state to sampled positions and stable cell identity. Appearance maps cells/UV/state/resources to color/glyph/opacity. Presentation maps committed target state to a displayed state over time. Component logic is an explicit state transition plus declared effects. Retain raw TypeScript callbacks for detailed math. Sampling can be deterministic without claiming arbitrary callbacks are pure or formally verified.

A future restricted expression graph may enable GPU/Wasm compilation. Add it only after measured workloads justify its cost. The current TypeScript compiler emits JavaScript; shaders and Rust/Wasm are separate backends with separate supported subsets.

## Interaction and receipts

A component address identifies it; an incarnation handle detects replacement; a revision detects stale state. None grants authority.

Invocation validates input and expected revision, then follows the method's declared commit policy. The committed domain receipt is distinct from a transition's `settled` result and a durable save/import receipt. An image method can commit target RGB before its presentation finishes. A routed delivery may commit on arrival, but that policy must be explicit and caller-independent.

Cancellation before commitment can prevent mutation; cancellation after commitment stops presentation without pretending to roll back state. Queue/replace/reject/blend policies are explicit. Retries have a bounded page-local scope unless durable authoring guarantees are specifically documented. No exactly-once network or distributed transaction promise.

## Source and resource ownership

Ordinary project files own editable component source. Saved versions include hashes, contracts, compatibility ranges, dependencies, examples/tests, license/attribution and provenance. Private photos/audio remain local resource handles by default. A component recipe describes resource slots, not user photo bytes or absolute paths.

Two import modes are explicit: maintained package imports and editable source copying. Source copying records upstream and installed hashes in a lock manifest. Upgrade planning performs three-way comparisons, reports conflicts, and preserves user changes. Restricted portable source and trusted project source have different execution privileges; provenance is not a safety certificate.

## Authoring and agent model

One semantic operation registry projects types, JSON schemas, tool descriptions, HTTP/CLI/MCP/native Hermes adapters, and docs. Domain contracts remain in runtime core. The Node service performs capability checks at the receiver, not only in tool registration.

Prompt/dictation produces a revision-bound source proposal. Text is editable before sending. Source commit, preview execution, resource access, project writes, and publication are separate permissions. Tool-free proposal workers are the default. A provider stays user-selected; installing Lattune must not change on-device/cloud model policy.

See [agent integration](agent-integration.md) for tools, persistence, security and plugin lifecycle.

## Delivery sequence

| Phase | Output | Blocking exit gate |
|---|---|---|
| P0 Preserve and specify | Source inventory, provenance, supported/lab split, API fixtures | No private data published; licensing path defined |
| P1 Package spine | ESM/declarations, headless core, explicit renderer/element entries | Packed artifacts installed in clean vanilla, Vite and SSR consumers |
| P2 Vertical component | Image-surface recipe, typed receive, color transition, native semantics | Same method/result through person, agent and peer; lifecycle/browser gates |
| P3 Authoring and imports | Compiler/CLI, immutable versions, source import/upgrade, receiver-side authorization | Source proposal through import works; capability denials and crash/retry/concurrency recovery |
| P4 Studio and agents | Unified project workspace, model proposal/dictation UX, Hermes/MCP through existing authorized service | Prompt-to-import journey, adapter parity and managed install/uninstall pass |
| P5 Beta and release | Curated recipes, docs, CI, compatibility and signed provenance | Release checklist passes against exact packed artifacts |

P0 precedes extraction; P2 and P3 depend on P1; P4 requires P3 and uses the P2 vertical slice; P5 requires all supported gates. This is a dependency plan, not a calendar estimate. Assign owners and estimates after P0 inventory. Prototype code is not evidence of completed phases.

## Definition of production ready

Production readiness means repeatable clean-project consumption, supported browser/lifecycle behavior, meaningful native accessibility, measured payload/performance, source-safe upgrades, enforced permissions, recoverable authoring writes, documented compatibility, and reproducible releases. It does not mean every experimental demo is production supported.

[Migration and release gates](migration-release.md) are mandatory acceptance evidence. [Roadmap](../roadmap.json) is the machine-readable breakdown. DevGraph is the canonical execution tracker; this document is the versioned product specification.
