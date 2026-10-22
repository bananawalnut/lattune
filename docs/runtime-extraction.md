# Runtime extraction evidence

Status: working private alpha, 2026-10-22. Package: `@lattune/runtime`, version `0.1.0-alpha.0`. This documents implemented behavior; [api-proposal.md](api-proposal.md) is the wider future design.

## Producer verification

Before porting, the prototype's `test-image-surfaces.cjs` and `test-photo-transition.cjs` passed. They exercise UV/RGB identity, alpha filtering, eight geometries, independent color math, deterministic transitions, interruption, invalid-frame atomicity and existing worker behavior. No prototype files were edited for this extraction.

## Extracted runtime verification

`npm run build:runtime` copies ESM sources and declarations into the packed distribution. `npm run test:runtime` covers eight meaningful suites: 24 saved geometric frames from the prototype; raw math/invalid geometry; contracts/revision/replay failures; target commitment versus settlement; interruption/reset; copied/bounded/expiring/releasable receiver resources; alpha/custom-transition atomicity; and DOM-forbidden imports of every public entry.

All modules have explicit exports and the package has no runtime dependencies. The root/core/geometry/image entries are headless. Renderer modules are import-safe and initialize browser resources only when called. No custom element registers at import.

## Actual consumer verification

`test:consumers` runs `npm pack`, installs the resulting archive in a separate directory, verifies installed declarations under strict browser and DOM-free SSR configurations, executes actual Node imports, and builds the Vite project. `@ts-expect-error` probes ensure unknown image methods and numeric resource IDs are rejected. The package archive allowlist excludes source workspaces, user resources, models and private stores.

The separate local demo renders real sampled geometry through WebGL2. Native controls invoke `receivePhoto`, show the committed receipt while presentation is still progressing, change the carrier geometry, and finish the transition independently. A second plain HTTP server exercises native ESM imports directly from installed package files without Vite transforms. Canvas fallback is checked separately in browser QA.

Measurements are produced by the consumer check for the exact build. The initial complete interactive demo measured about 21.4 KB gzip of JavaScript, including UI, image/core math and combined WebGL2/Canvas implementation. This is not the <=15 KB proposed basic-scene budget and is not an FPS measurement. Renderer splitting and device/browser performance remain later gates.

## Remaining constraints

This slice ships no native Web Component adapter, extracted author compiler, source import/upgrade engine, browser component directory, Hermes/MCP adapter, durable receipts, or preview sandbox. Callback math is trusted application code. Runtime request replay retains only the latest 128 IDs per live instance; it is not durable exactly-once delivery. Sampled frame arrays are borrowed, must not be mutated, and require a copy for retention.

The current image recipe always owns its cell grid; a received photo maps colors into its existing UVs rather than changing that geometry's aspect ratio. Full device/browser, assistive-technology, context-loss and resource-stress release gates are not yet certified. Voice/model policy and the original Studio remain unchanged.
