# Lattune

**Programmable surfaces. Meaningful motion. Components you own.**

Lattune is the proposed successor to Glyph Studio: an importable interaction library, a local component authoring studio, and thin integrations for Hermes and other agents.

**Status: product blueprint and interactive design concept. No production library, compiler, agent connection, or npm packages are shipped by this repository yet.** The existing Glyph Studio remains the working prototype; it has not been renamed, deleted, or bulk-copied here.

## Start here

- [Production blueprint](docs/production-blueprint.md) — scope, architecture, sequencing, exit criteria.
- [Roundtable and decisions](docs/roundtable.md) — three independent reviews and resolved tradeoffs.
- [Product redesign](docs/product-design.md) — the new Studio workflow and interaction model.
- [Public API proposal](docs/api-proposal.md) — component contracts, geometry, resources, receipts, imports.
- [Agent and Hermes integration](docs/agent-integration.md) — semantic tools, permissions, installation lifecycle.
- [Migration and release gates](docs/migration-release.md) — what moves, what stays experimental, what proves readiness.
- [Machine-readable roadmap](roadmap.json) and [package boundaries](architecture.json).

## Preview the Studio concept

```sh
npm run dev
# http://127.0.0.1:8792
```

The concept uses native HTML, CSS, JavaScript, and one Canvas 2D preview. It illustrates the intended layout, inspector, source proposal review, and import plan. Designer proposals are scripted examples; it does not call a model, compile TypeScript, install components, or connect to Hermes. No dependencies or build step are required.

```sh
npm run check
```

Checks validate the planning artifacts and concept syntax. They do not certify an unimplemented runtime.

![Lattune Studio design concept](docs/assets/studio-concept.png)

[Foundation verification record](docs/foundation-verification.md).

## Intended product boundaries

| Deliverable | Responsibility | Status |
|---|---|---|
| `@lattune/runtime` | Typed contracts, geometry, optional renderers, image behaviors, native elements | Proposed; scope unreserved |
| `@lattune/author` | TypeScript authoring, compiler, diagnostics, CLI, artifact manifests | Proposed |
| `@lattune/agent` | Typed operation registry, clients, isolated Node authoring service | Proposed |
| Lattune Studio | Local project editor, preview, inspector, Designer | Design concept |
| Hermes plugin | Thin tools, skill/profile, connection and installation management | Planned |

Public package names are examples until the npm scope is secured. A public repository is not an npm release or a license grant. Licensing is an explicit release decision; current package metadata is `UNLICENSED`.

## Design principles

1. The library works without Studio, an agent, a camera, or a compiler in the visitor's page.
2. People, agents, and components use the same typed methods.
3. Component source belongs to the consuming project; upgrades preserve local edits.
4. State commitment and visual completion are distinct events.
5. Mathematical freedom stays available; GPU optimization is earned by measurements.
6. Native HTML carries meaningful content and controls; motion has accessible alternatives.

The name Lattune combines lattice and attune. A preliminary exact-name check on 2026-10-22 returned no GitHub repositories or unscoped npm package. No domain, npm organization, or trademark rights are reserved or asserted.
