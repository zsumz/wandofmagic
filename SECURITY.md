# Security policy

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue
for a suspected vulnerability until a fix and disclosure plan are ready.

Reports are especially valuable when they include:

- the affected version or commit
- a minimal reproduction
- the security impact
- whether the issue exposes values through receipts or errors
- whether it involves getters, prototypes, path traversal, or package publishing

## Security posture

Wandofmagic treats boundary input as untrusted data. The 1.0 contract requires:

- no input mutation
- no implicit getter execution
- prototype-pollution path rejection
- bounded descriptor-only deep traversal with touched-cycle rejection
- no raw values in receipts or serialized issues
- zero runtime dependencies in the core package
- npm trusted publishing with provenance from a public GitHub repository

Checked execution is the boundary-safe default. The trusted runtime mode and generated mappers are
unchecked performance contracts for caller-proven own-data records; they must not be used directly
on proxies, accessors, inherited enumerable properties, or otherwise untrusted input.
