export type ErasedDerive = (values: never) => unknown;
export type ErasedTransform = (value: never) => unknown;

export function invokeTransform(transform: ErasedTransform, value: unknown): unknown {
    return transform(value as never);
}

export function invokeDerive(derive: ErasedDerive, values: readonly unknown[]): unknown {
    return derive(values as never);
}

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
