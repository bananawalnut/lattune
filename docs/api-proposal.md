# Public API proposal

**This is the long-term API proposal. Its code examples are not the shipped alpha API.** See [the implemented runtime](../packages/runtime/README.md). Names and signatures will be validated against extracted internals in P0/P1. `@lattune` is a provisional npm scope.

## Definitions, instances and methods

A definition owns typed props/state/contracts and pure state transitions. A headless instance owns semantic state, method invocation and subscriptions without a view. Mounting a view attaches a renderer and DOM lifecycle. Detaching the view need not reset semantic state or release application-owned resources. Full instance disposal releases its owned resources/subscriptions. Programmer-designed methods can be arbitrary named functions with declared schemas; capabilities such as photo receipt are composed, not universally imposed.

```ts
// PROPOSED: not a currently installable API.
import { defineComponent, schema } from '@lattune/runtime/core';
import { surface } from '@lattune/runtime/geometry';
import { photoReceipt } from '@lattune/runtime/image';

export const imageShell = defineComponent({
  id: 'studio/image-shell',
  version: '1.0.0',
  semantics: { name: 'Image shell', purpose: 'Arrange photo colors on a curved cell field' },
  props: schema.object({ curvature: schema.number(), cellCount: schema.integer() }),
  state: schema.object({ photo: schema.optional(schema.resource('image')) }),
  initialState: {}, // absent optional property; no undefined in portable state
  sampling: { kind: 'stable-uv-grid', countFrom: 'cellCount', seed: 7 },
  methods: photoReceipt({
    commit: 'before-presentation',
    interrupt: 'replace-from-displayed',
    transition: { kind: 'uv-wave', durationMs: 900, seed: 7 },
  }),
  geometry: surface(({ u, v, props }) => [
    (u - .5) * 2,
    (v - .5) * 2,
    Math.sin(u * Math.PI) * props.curvature,
  ]),
  metadata: { atomic: 'molecule' },
});
```

The proposed sampling clause connects `cellCount` to stable IDs/UVs. Define count-change remapping, aspect-ratio handling and fixtures before stabilizing it. Portable state uses finite JSON values and serializable resource references, not live resource objects or `undefined`; optional/nullable schema behavior needs compatibility fixtures.

A raw math function can inspect time/props/state through a defined context. It must not implicitly receive mutable application objects, authority or hidden global state. Determinism requires declared seed/time/resource versions and stable sampling. Host code can opt into trusted extensions; that is a different trust mode from restricted portable authoring.

## Consumption and lifecycle

```ts
// PROPOSED.
import { mount } from '@lattune/runtime/elements';
import { webgl2 } from '@lattune/runtime/renderers/webgl2';
import { imageShell } from './components/image-shell';

const instance = mount(host, imageShell, {
  props: { curvature: .4, cellCount: 1600 },
  renderer: webgl2(), // Canvas fallback is a separately measured explicit adapter
  accessibleContent: photoCaptionElement,
});
const resource = await instance.resources.stage(file);
const invocation = instance.invoke('receivePhoto', { resourceId: resource.id }, {
  expectedRevision: instance.revision,
  requestId: crypto.randomUUID(),
});
const committed = await invocation.committed;
const settled = await invocation.presentation?.settled;
instance.dispose(); // releases owned listeners, resources, workers, GPU objects
```

Default imports must not touch `window`, `document`, `customElements` or GPU state. Element registration is explicit. Owned and borrowed resources have distinct release rules; disposing an instance cannot destroy a shared host-owned resource.

## Receipt semantics

| Receipt | Proves | Does not prove |
|---|---|---|
| Acceptance | Invocation validated/admitted under current policy | Domain state changed |
| Commitment | Domain method committed target state at a known revision | Visual transition finished or persisted across reload |
| Presentation settlement | Transition finished/skipped/interrupted with reason | Rollback, durable save, network delivery |
| Artifact receipt | Source/version/hash durably saved or import plan committed | Preview/contract tests passed unless evidence is attached |

`.committed` and `.presentation.settled` above describe one possible API shape. A committed receipt remains successful when later motion is interrupted. Cancellation before commit may reject the command; after commit it only stops presentation. A transport adapter must not rename every receipt to `completed`.

## Shared discovery and invocation

```ts
// PROPOSED; directory metadata never confers authority.
const receiver = directory.discover({ capability: 'image.receive.v1' })[0];
const contract = directory.describe(receiver.address);
// photo.id must already be staged/granted in this receiver's resource namespace.
const result = directory.invoke({
  address: receiver.address,
  incarnation: receiver.incarnation,
  method: 'receivePhoto',
  input: { resourceId: photo.id },
  expectedRevision: contract.revision,
  requestId,
});
```

Resource IDs are receiver-authorized handles. Cross-instance reuse requires explicit staging or a scoped resource grant; discovering a receiver or possessing an ID does not expose bytes. DOM locators are additional browser hints, not canonical IDs or permissions. Headless discovery remains usable. The same contract drives native UI forms, semantic agent descriptions and peer calls.

## Portable component manifest

```json
{
  "format": "lattune.component.v1",
  "id": "studio/image-shell",
  "version": "1.0.0",
  "source": { "path": "image-shell.ts", "sha256": "<computed>" },
  "artifact": { "sha256": "<computed>", "compilerVersion": "<pinned>" },
  "compatibility": { "runtime": "<tested range>", "author": "<tested range>" },
  "trust": "portable-restricted",
  "metadata": { "atomic": "molecule" },
  "resources": [{ "slot": "photo", "kind": "image", "required": false }],
  "dependencies": [],
  "license": "<owner selected license>",
  "attribution": [],
  "tests": ["image-shell.contract.ts"]
}
```

A manifest references schemas and source; it must not become a second independently maintained method contract. Saved recipes exclude user photos, recordings, connection secrets and absolute paths. A host resource resolver must explicitly authorize remote URLs.

## Source import and upgrades

`planImport` returns exact destination paths, dependency changes, upstream hashes, conflicts and a plan hash. `applyImport` checks that hash and expected destination revisions. `lattune.lock.json` records upstream version/hash/license, installed path/hash and dependency versions. `planUpgrade` compares upstream base, new upstream and locally edited files. Conflicts require explicit resolution; no implicit overwrite.

Package imports run trusted application code with host privileges. Portable source previews use restricted imports, bounded compilation, isolated execution and resource grants. Hash provenance establishes identity, not safety.
