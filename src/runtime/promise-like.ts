/** Detect callback results that would make the synchronous core accidentally asynchronous. */
export function isPromiseLike(value: unknown): boolean {
    if (
        value === null ||
        typeof value !== 'object' && typeof value !== 'function'
    ) {
        return false;
    }

    return typeof Reflect.get(value, 'then') === 'function';
}
