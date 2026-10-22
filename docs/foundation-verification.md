# Foundation verification

Date: 2026-10-22. Scope: this planning repository and its scripted design concept.

## Executed checks

- `npm run check` on local Node v20.20.0: roadmap dependency DAG, architecture dependency DAG, runtime dependency restrictions, placeholder status, linked local Markdown paths, duplicate DOM IDs, syntax of concept/server/check scripts, and basic public-file exclusions passed.
- Local HTTP: concept, JavaScript and blueprint returned 200; unrelated package metadata and Git internals returned 404; encoded traversal returned 404; POST returned 405. Served pages carry a CSP denying outbound connections and embedded objects.
- In-app browser at 1280 × 720: selected Shell + signal, observed changed heading/source/preview, inspected the shared receive method, entered an example prompt, opened a clearly labeled scripted diff, applied it to the concept and confirmed compile/test status remained unrun.
- Opened import plan and verified it states source ownership, provenance and no file writes. Escape dismissed the dialog and focus returned to Import plan.
- Returned to the default image-surface concept, paused decorative motion, and captured `docs/assets/studio-concept.png`.
- Architecture and integration reviewers read final drafts; their concrete corrections are recorded in the roundtable.

## Not established

No runtime package, compiler, model connection, actual component import, Hermes installation, MCP endpoint, cross-browser support, screen-reader certification, npm provenance or production performance has been tested or shipped here. Those are future release gates. The GitHub workflow runs only foundation checks; its remote result must be inspected after push rather than inferred from local success.
