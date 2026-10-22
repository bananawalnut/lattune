# ADR 0001: Library first, thin authoring clients

Status: accepted direction, implementation pending. Date: 2026-10-22.

Use three initial packages: runtime, author and agent. Runtime owns component contracts and optional subpaths; author owns compiler/provenance; agent/node orchestrates workspaces and authority. Studio, CLI, Hermes and MCP use those shared APIs.

Rejected: a Studio-centered private database as the only source of truth; MCP as business logic; many separately versioned feature packages before real consumers.

Consequences: package graphs and packed-consumer tests are release requirements; authoring cannot leak into visitor bundles. Experimental capture and animals stay outside the supported core.
