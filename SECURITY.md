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

Wandofmagic treats boundary input as untrusted data. Checked execution is designed to:

- leave the input unchanged
- avoid implicit getter execution
- reject prototype-pollution paths
- reject cycles in any object path an operation touches
- keep raw values out of receipts and serialized issues
- keep the core package free of runtime dependencies

Checked execution is the default. It accepts plain objects and null-prototype objects and inspects
their property descriptors instead of reading accessors.

Trusted execution and generated mappers skip some of those checks for speed. Use them only when the
caller guarantees plain records with own enumerable string data properties, no accessors, no
proxies, no enumerable symbols, and no inherited enumerable properties. Do not use either mode
directly on untrusted input.

See the [usage guide](./USAGE.md#use-trusted-execution) for an example.
