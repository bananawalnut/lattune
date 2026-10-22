# Prototype inventory

Recorded 2026-10-22 against Glyph Studio base commit `70c5033d90c377d54d23e8e6af6fe7feea4f9e47`, including individually identified modified/untracked working-tree source. [Machine-readable inventory](inventory.json) records 236 source/document/static-source files with hashes, sizes and dispositions. The inventory is metadata, not a bulk source copy.

| Disposition | Files | Treatment |
|---|---:|---|
| Selected extraction inputs | 5 | Reviewed contracts, geometry, image colors/transitions and rendering |
| Other reference | 57 | Retain in the working prototype |
| Generated reference | 63 | Rebuild from sources where needed; do not make generated pages canonical |
| Capture/animal/tracking labs | 50 | Excluded from this runtime |
| Agent integration | 48 | Later thin-adapter/service extraction |
| Author/compiler | 7 | Later development-only package |
| Flow/DOM integration | 6 | Optional later feature; not bundled into this image runtime |

## Exact selected boundaries

- `player/flow-core.js`: contract validation, finite JSON and ComponentInterface only. Routing/layout are left behind. A new headless instance owns revisioned state and bounded in-memory invocation receipts.
- `player/program.js`: parametric surfaces/paths, transforms, composites and typed-buffer sampling, converted to native ESM.
- `player/image-surface.js`: pixel-to-cell UV/RGB, geometry presets, color fields and photo transitions. TypeScript source generation and sample-asset helpers are omitted from the runtime. Resource release/disposal are added; the public facade enforces receiver-local expiry.
- `player/geometry.js`: numerical helpers used by the extracted renderer.
- `player/renderer.js`: explicit ESM initialization; document-based import-time URL resolution removed; optional Wasm requires an explicit caller URL. Existing WebGL2/Canvas implementation is preserved together and measured together.

Input hashes and destinations appear in `inventory.json`; packaged `dist/provenance.json` carries the selected input provenance. Formatting and reviewed API/lifecycle changes mean output files are not byte-identical copies.

## Compatibility and fixture ownership

The working prototype is unchanged. Existing stored presets, scripts and callbacks continue using its old globals and contracts. The new package is a separate alpha API: image receive/reset payloads preserve `{photo:string}` / `{}`, while its new outer receipt explicitly says `committed`. Legacy internal image/frame tags are retained deliberately; they are not a finalized Lattune interchange format.

Synthetic four-cell fixtures captured from the prototype cover all eight presets at three phases, including alpha omission, stable IDs/UV and exact RGB/Float32 positions. Original image-surface and photo-transition tests passed before extraction. Public fixtures contain no user photographs.

## Ownership and release limits

The user directed extraction of their prototype into this repository. No third-party tracking assets, MediaPipe, fonts, model weights, private resources, runtime databases, connection files or credentials were copied. An open-source license has not been chosen; local packed use remains private-alpha/UNLICENSED, with no npm publication. Formal license/notice and public-release checks remain gates rather than inferred approval.
