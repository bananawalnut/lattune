# ADR 0002: Project-owned source and explicit receipt layers

Status: accepted direction, implementation pending. Date: 2026-10-22.

Project files own editable source. Package imports and copyable recipes are separate supported modes. Source upgrades use provenance and three-way conflict review.

Method commitment, presentation settlement and durable artifact save/import are different outcomes. Methods declare commit/interruption policy; clients do not change it. Cancelling a committed transition never silently rolls state back.

Rejected: treating all completion as one promise; claiming exactly-once durability for page-local animation; silently overwriting locally edited recipes.

Consequences: more explicit result types and lifecycle tests; no generic completed badge without an evidence type and artifact/revision identity.
