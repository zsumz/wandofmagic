import type { DataRecord } from '../../src/core/execution/data-record.js';
import { getDataPropertyValue } from '../../src/internal/type-boundary/record.js';

export function dataRecord(value: object): DataRecord {
    return value as DataRecord;
}

export function ownValue(value: object, key: string): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !('value' in descriptor)) {
        throw new Error(`Expected an own data property at ${key}.`);
    }
    return getDataPropertyValue(descriptor);
}

export function asObject(value: unknown): object {
    if (typeof value !== 'object' || value === null) {
        throw new TypeError('Expected an object in the test fixture.');
    }
    return value;
}

export function createNullPrototype(): object {
    return Object.create(null) as object;
}
