# Designer, Hermes and MCP

Status: target contract, not an implemented connection in this repository.

## One service, multiple clients

Runtime component schemas are canonical. The author package owns compilation, diagnostics and artifact provenance. Its default/vocabulary entry is browser-safe; `author/node` owns compiler and CLI. Studio browser code uses the service for compilation and must not transitively import Node/compiler/provider code. `agent/node` orchestrates workspace revisions, authorization, jobs and persistence through author APIs. Studio, CLI, native Hermes and MCP call the same operations. Default browser client exports cannot import Node credentials, process launchers, provider SDKs or the compiler.

A semantic operation registry generates JSON Schema, TypeScript types, descriptions and adapter registrations. Every operation declares its target, changes, authority, revision precondition, resource access, execution behavior, timeout/cancellation, retry semantics, result schema and errors.

| Family | Initial operations | Required authority examples |
|---|---|---|
| Catalog | search, describe, readVersion | catalog:read |
| Workspace | read, propose, check, commit | source:read / source:propose / source:commit |
| Versions | create, read | source:version for immutable catalog saves; catalog:read |
| Build | compile, inspectArtifact | source:read; isolated build grant |
| Preview | createSession, inspect, invoke, dispose | preview:execute; scoped component:invoke |
| Designer | start, inspectJob, cancel | source:propose; selected provider/resource grants |
| Resources | stage, describe, release | resource grants bound to IDs/session |
| Project | planImport, applyImport, planUpgrade | project:read / project:write for exact roots |

Expose small role-specific toolsets. Server-side checks must reject manually crafted calls outside a principal's capabilities. A connection bearer token is not permission to mutate every project. Addresses and incarnation handles are freshness/location data; MCP annotations are descriptions, not authority.

`workspace.commit` durably changes revisioned project source; it does not publish or create a reusable version. `versions.create` snapshots exact source/contracts/artifact hashes into an immutable catalog version with dependencies, compatibility and license metadata. It returns a durable version receipt. Validation evidence is attached only for the exact hash that was checked. Importing files and publishing a package are separate actions.

Baseline receiver authorization and root grants ship in P3 with the first durable writes. P4 adds adapters and UX over that protected service.

## Example semantic tool

**project.planImport** — computes a non-mutating import proposal for one immutable component version into one granted project root. Reads current destination hashes. Reports new files, dependency changes and conflicts. Does not execute source or write files. Returns plan ID/hash, base revisions and diagnostics. Errors include unauthorized root, unsupported compatibility and missing source version.

**project.applyImport** — writes only the exact previously planned changes after rechecking plan hash, request ID and destination revisions. Requires project-write capability for that root. Returns a durable artifact receipt. If files changed since planning, rejects with a conflict and preserves local files. Retrying identical arguments returns the original committed result; reusing an ID with different input fails. Canonical destination roots and symlinks are checked during planning and revalidated at write time. Path traversal and symlink escapes are rejected. Applying an import does not execute imported source, package managers or lifecycle scripts. Dependency edits may be planned and explicitly reviewed; installing or running them requires a separate authorized operation.

Tools must describe these differences, not simply say “installs a component.”

## Persistence and recovery

Source files remain authoritative; the workspace store tracks drafts, revision pointers, jobs, grants and receipts. Save/import operations use a journal or equivalent atomic/recoverable mechanism. Durable mutations bind request ID, target, expected revision and input hash. On restart, abandoned jobs become interrupted; corrupt metadata offers recovery without deleting valid source. Recovery and deduplication are tested under forced process termination.

Browser animation receipts are intentionally bounded/page-local. Authoring and project-write receipts survive service restarts. Do not conflate the two.

## Prompt and dictation workflow

1. Read source/contract and declared public context at a fixed revision.
2. Transcribe into editable text when voice is used; show processing/provider choice.
3. Generate a tool-free source proposal by default.
4. Return source diff, changed methods/dependencies/resources and base revision.
5. Compile and test exact source/artifact hashes through explicit operations.
6. Commit only if current revision still matches. Keep stale proposals available for review.
7. Import into another project through its separate plan/apply contract.

Photo/audio bytes, private paths and credentials are absent from model context by default. A user-selected on-device model remains on-device; plugin installation never silently changes provider, model or gateway. A user may explicitly choose Codex or another provider through a separate adapter/configuration path.

## Hermes distribution

Use a standalone native plugin distribution built from `plugins/hermes` in this monorepo. The release can be an installable plugin artifact; if Hermes catalog requirements demand a dedicated plugin repository, mirror only the generated thin distribution and provenance, not a second domain implementation.

Follow the official [Hermes plugin guide](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins): plugin manifest plus native registration, accurate tool declarations, explicit enablement and current supported lifecycle. Validate against a pinned Hermes release in CI instead of assuming every installed version supports the newest APIs. Ship a repository skill explaining authoring vocabulary, workflows and limitations, and optionally install the Designer identity/profile.

Managed lifecycle requirements:

- Explicit target Hermes home/profile and dry-run plan.
- Owned-file/hash manifest and conflict reports for local changes.
- Transactional install/update with rollback after partial failure.
- Uninstall only unchanged owned files and owned configuration entries.
- Preserve unrelated plugins, identity, provider and model settings.
- Optional profile installation independent from tools.
- Doctor checks service/API/plugin compatibility, stale connection and credential rotation.
- Version negotiation rejects unsupported mutations.

A local plugin operates with host privileges. It must not install arbitrary dependencies or expand authority merely because a generated component requests them.

## MCP adapter

Implement MCP as an optional transport over the same operation registry. Use declared input/result schemas and tested cancellation/error mapping. Pin and negotiate a tested protocol range; this plan uses the versioned [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) as a reference, not a claim that it is the newest version.

MCP and Hermes parity tests compare results, revisions, durable receipts and denied operations with direct service/CLI calls. Tool annotations never replace authorization or the distinction between compilation and execution.

## Security release evidence

Exercise forbidden roots and resource IDs, stale handles, unexpected methods, malformed schemas, replayed request IDs, cross-origin calls, expired grants, arbitrary HTTP and plugin-update conflicts. Preview cannot inherit the owner's broad filesystem/model credentials. Test forged/stale worker messages, denied network/filesystem/provider access, and hung-code termination without losing the last valid artifact. Trusted project source runs with the consuming application's privileges; document that separately from restricted preview isolation.
