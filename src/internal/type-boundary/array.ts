/** Narrow an untrusted array without allowing Array.isArray's `any[]` predicate to escape. */
export function isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/** Allocate a typed sparse array without exposing the standard library's `any[]` constructor. */
export function createSparseDataArray(length: number): unknown[] {
    return new Array(length) as unknown[];
}
