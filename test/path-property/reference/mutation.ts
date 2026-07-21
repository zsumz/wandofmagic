import type { DataRecord } from '../../../src/core/execution/data-record.js';
import type { FieldPath, PathSegment } from '../../../src/core/path/path.js';
import { getDataPropertyValue } from '../../../src/internal/type-boundary/record.js';
import { cloneReferenceFixture } from './clone-fixture.js';
import { defineReferenceField } from './data-field.js';

export function referenceSet(root: DataRecord, path: FieldPath, value: unknown): DataRecord {
    const clone = cloneReferenceFixture(root);
    let container = objectContainer(clone);
    for (let index = 0; index < path.length - 1; index += 1) {
        const segment = requiredSegment(path, index);
        const nextSegment = requiredSegment(path, index + 1);
        const existing = readReferenceField(container, segment);
        const child = !existing.found || existing.value === undefined
            ? createContainer(nextSegment)
            : existing.value;
        if (!existing.found || existing.value === undefined) {
            defineReferenceField(container, segment, child);
        }
        container = objectContainer(child);
    }
    defineReferenceField(container, requiredSegment(path, path.length - 1), value);
    return dataRecord(clone);
}

export function referenceDelete(root: DataRecord, path: FieldPath): DataRecord {
    const clone = cloneReferenceFixture(root);
    let container = objectContainer(clone);
    for (let index = 0; index < path.length - 1; index += 1) {
        const existing = readReferenceField(container, requiredSegment(path, index));
        if (!existing.found || existing.value === undefined || existing.value === null) {
            return dataRecord(clone);
        }
        container = objectContainer(existing.value);
    }
    Reflect.deleteProperty(container, requiredSegment(path, path.length - 1));
    return dataRecord(clone);
}

function createContainer(nextSegment: PathSegment): Record<string, unknown> | unknown[] {
    return typeof nextSegment === 'number' ? [] : {};
}

function objectContainer(value: unknown): Record<PropertyKey, unknown> | unknown[] {
    if (typeof value !== 'object' || value === null) {
        throw new TypeError('The reference corpus traversed an unsupported value.');
    }
    return value as Record<PropertyKey, unknown> | unknown[];
}

function requiredSegment(path: FieldPath, index: number): PathSegment {
    const segment = path[index];
    if (segment === undefined) {
        throw new TypeError('The reference corpus received an empty path.');
    }
    return segment;
}

function readReferenceField(
    container: Record<PropertyKey, unknown> | unknown[],
    segment: PathSegment,
): { readonly found: boolean; readonly value: unknown } {
    const descriptor = Object.getOwnPropertyDescriptor(container, segment);
    return descriptor === undefined
        ? { found: false, value: undefined }
        : { found: true, value: getDataPropertyValue(descriptor) };
}

function dataRecord(value: object): DataRecord {
    return value as DataRecord;
}
