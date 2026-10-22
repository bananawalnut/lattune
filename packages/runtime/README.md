# Runtime — private alpha

Native ESM contracts, parametric geometry, eight image-surface presets, cell color receipt and explicit WebGL2/Canvas rendering. No runtime dependencies. The product name is being finalized; import examples use the temporary scope from package.json.

Build from the repository root with `npm run build:runtime`, then create an archive with `npm pack ./packages/runtime`. Install that archive in a consumer project.

```ts
import { createImageSurface } from '@lattune/runtime/image';
import { createRenderer } from '@lattune/runtime/renderers/webgl2';

const component = createImageSurface({
  pixels: imageData,
  sampling: { columns: 84, rows: 56 },
  preset: 'bend',
  transition: { duration: 2.4, mode: 'sweep' },
});
const renderer = createRenderer(canvas);
const frame = component.sample(0);
renderer.setPointBuffers(frame.descriptor, frame.buffers, frame.colors);
renderer.render(frame.descriptor, 0);

const offer = component.stagePhoto(nextImageData);
const committed = component.invoke('receivePhoto', offer, {
  expectedRevision: component.revision,
  requestId: crypto.randomUUID(),
});
component.advance(1 / 60); // host-controlled presentation clock
component.finishTransition(); // reduced-motion endpoint; target state stays committed
// Sample and render the new frame after advancing.
component.dispose();
renderer.dispose();
```

`pixels` is `{width,height,data:Uint8Array|Uint8ClampedArray}` in RGBA order. Decoding files is a host responsibility. Cells keep stable UV/id/color identity independently of XYZ. Frame buffers are borrowed until the next sample; copy with `.slice()` when retaining a frame and never mutate borrowed buffers. Appearance callbacks and raw geometry math run synchronously as trusted host code; this package is not a code sandbox.

`describe()` exposes state/input/output schemas. `invoke()` returns a committed, in-memory domain receipt, not a durable save or finished animation. `transition`, `advance`, `seek` and `finishTransition` control presentation separately. Replacing a photo starts from the currently displayed colors. `resetPhoto` takes `{}`. Staged photo handles are receiver-local, single-use, limited to four and expire after 60 seconds by default. Resource access is not implied by discovery.

Request replay caches the latest 128 request IDs for that instance only. Identical retries return the same receipt; different arguments conflict. Evicted IDs and disposed instances have no deduplication guarantee. These are not durable authoring or network-delivery receipts.

Imports do not access the DOM or register elements. No Web Component adapter is shipped yet. The renderer is initialized explicitly; its current extracted implementation includes Canvas fallback in the same module, even via the Canvas entry. Its measured combined bundle is not a claim of independently optimized renderer subpaths. Wasm loading is optional and requires an explicit URL; no Wasm asset is included in this slice.
