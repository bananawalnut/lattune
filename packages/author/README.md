# Author package boundary

Planned, not implemented or publishable. Expose browser-safe vocabulary/types separately from `author/node` compiler, diagnostics, CLI and source/artifact manifests. Studio browser code calls the authoring service rather than importing the Node compiler. Output targets runtime public APIs. Model providers and workspace orchestration belong outside this package. Source recipes and trusted project source have explicit different trust modes.
