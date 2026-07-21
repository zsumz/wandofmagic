import { createSparseDataArray, isUnknownArray } from '../../../src/internal/type-boundary/array.js';
import {
    getDataPropertyValue,
    getObjectPrototype,
} from '../../../src/internal/type-boundary/record.js';
import { defineReferenceField } from './data-field.js';

export function cloneReferenceFixture(value: object): object;
export function cloneReferenceFixture(value: unknown): unknown;
export function cloneReferenceFixture(value: unknown): unknown {
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    const clone: Record<PropertyKey, unknown> | unknown[] = isUnknownArray(value)
        ? createSparseDataArray(value.length)
        : Object.create(getObjectPrototype(value)) as Record<PropertyKey, unknown>;
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor !== undefined && 'value' in descriptor) {
            defineReferenceField(
                clone,
                key,
                cloneReferenceFixture(getDataPropertyValue(descriptor)),
            );
        }
    }
    return clone;
}
