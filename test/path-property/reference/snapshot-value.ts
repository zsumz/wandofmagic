import { getDataPropertyValue } from '../../../src/internal/type-boundary/record.js';

export function snapshotReferenceValue(value: unknown): unknown {
    if (value === undefined) {
        return { kind: 'undefined' };
    }
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    const entries = Object.keys(value).map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        const fieldValue = descriptor === undefined
            ? undefined
            : getDataPropertyValue(descriptor);
        return [key, snapshotReferenceValue(fieldValue)] as const;
    });
    return {
        entries,
        kind: Array.isArray(value)
            ? 'array'
            : Object.getPrototypeOf(value) === null ? 'null-record' : 'record',
        length: Array.isArray(value) ? value.length : undefined,
    };
}
