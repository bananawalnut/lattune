# Image-surface runtime

Working repository name: Lattune. The replacement name is still being chosen; see [the naming ceremony](docs/naming-ceremony.md).

**An instrument for giving data form, color, and motion.**

Lattune is an interaction library with a planned local authoring studio and Hermes/MCP integrations. Its first working slice is a **private alpha runtime** that can be packed and imported into a separate coding project. It has no runtime dependencies.

The inventory and initial extraction are implemented. The Studio at `apps/studio-concept` remains a scripted design concept; agent integrations, compiler extraction, native Web Components and the remaining production release gates are planned.

## Run and verify

```sh
npm ci
npm run build:runtime
npm run test:runtime
npm run test:consumers
npm run check
```

`test:consumers` creates a clean project outside the repository, packs the runtime, installs its actual archive, checks strict TypeScript (including an SSR configuration without DOM types), imports it server-side with DOM access forbidden, and builds a Vite app. It prints the project location and measured bundle sizes. It uses no workspace link, path alias, Studio, model or global-script runtime.

To keep a particular consumer project, run `npm run test:consumers -- --project /absolute/destination`. Use a new or test-owned directory: fixture files are copied there. Then in that directory run `npm run dev` (Vite, port 8793) and optionally `npm run dev:plain` (native ESM, port 8794). The no-build page loads the installed package files directly from its own Node server.

## Import an image surface

```ts
import { createImageSurface } from '@lattune/runtime/image';
import { createRenderer } from '@lattune/runtime/renderers/webgl2';

const surface = createImageSurface({
  pixels: imageData, // { width, height, data: RGBA Uint8Array/Uint8ClampedArray }
  sampling: { columns: 84, rows: 56 },
  preset: 'bend',
  transition: { duration: 2.4, mode: 'sweep' },
});
const view = createRenderer(canvas);
const frame = surface.sample(0);
view.setPointBuffers(frame.descriptor, frame.buffers, frame.colors);
view.render(frame.descriptor, 0);

const committed = surface.invoke('receivePhoto', surface.stagePhoto(nextImageData));
// The host advances presentation and renders another sampled frame.
surface.advance(1 / 60);
surface.dispose();
view.dispose();
```

Create an archive after building with `npm pack ./packages/runtime`, then install that `.tgz` in your project. The package is not published on npm. Its scoped name is provisional; npm scope ownership has not been established. The code is `UNLICENSED` pending an explicit license decision.

## What works now

- Headless runtime contracts and programmer-defined methods with revision checks and bounded in-memory replay receipts.
- Parametric surfaces, paths, cubic curves, composites and stable point buffers.
- Image surfaces with eight geometric presets, custom synchronous math, stable UV/cell identity, independent RGB fields and five color-transition modes.
- Receiver-local photo handles: copied pixel input, expiry, explicit release, capacity limits and disposal.
- Explicit WebGL2 renderer with extracted Canvas fallback; import-time SSR safety.
- Declarations and actual tarball consumption in independent Vite/native-ESM/SSR projects.

Read the [runtime API and limitations](packages/runtime/README.md), [inventory](docs/inventory.md), and [extraction evidence](docs/runtime-extraction.md).

## Direction and remaining work

- [Production blueprint](docs/production-blueprint.md)
- [Roundtable and naming history](docs/roundtable.md)
- [Studio redesign](docs/product-design.md) — run `npm run dev` for the labeled concept.
- [Long-term API proposal](docs/api-proposal.md) — distinguish it from today's alpha API.
- [Designer, Hermes and MCP plan](docs/agent-integration.md)
- [Migration and release gates](docs/migration-release.md)
- [Roadmap](roadmap.json) and [package boundaries](architecture.json)

DevGraph tracks this bounded effort under the existing Front-end tools and component libraries initiative. Stable record IDs retain their original `lattune-` prefix to preserve history.

The current shared renderer includes both WebGL2 and Canvas code. Its bundle is measured as that combined implementation. This alpha does not certify mobile/Safari support, context recovery, accessibility completeness, durable authoring writes, or the proposed minimal-scene performance budget. Capture and animal research remain separate labs in the preserved Glyph Studio prototype.
