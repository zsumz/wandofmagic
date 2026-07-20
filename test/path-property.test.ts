import { describe, expect, it } from 'vitest';

import type { DataRecord } from '../src/core/data-record.js';
import { PlanError } from '../src/core/errors.js';
import type { FieldPath, PathInput, PathSegment } from '../src/core/path.js';
import {
    createSparseDataArray,
    getDataPropertyValue,
    getObjectPrototype,
    isUnknownArray,
} from '../src/internal/type-boundary.js';
import { deletePathValue } from '../src/runtime/delete-path-value.js';
import { normalizePath } from '../src/runtime/normalize-path.js';
import { setPathValue } from '../src/runtime/set-path-value.js';

const dangerousSegments = ['__proto__', 'prototype', 'constructor'] as const;

describe('deep path property corpus', () => {
    it('rejects every dangerous segment at every supported depth', () => {
        for (const dangerous of dangerousSegments) {
            for (let index = 0; index < 8; index += 1) {
                const segments = Array.from(
                    { length: index + 1 },
                    (_, segmentIndex) => `field${String(segmentIndex)}`,
                );
                segments[index] = dangerous;

                expect(capturePlanError(() => normalizePath(pathInput(segments))).code)
                    .toBe('dangerous_key');
            }
        }
    });

    it('matches a deliberately simple reference implementation', () => {
        const paths = mutationPaths();
        const values: readonly unknown[] = ['changed', 0, 42, false, null, undefined];
        const random = deterministicRandom(0x5eeda11);

        for (let run = 0; run < 256; run += 1) {
            const path = requiredItem(paths, random() % paths.length);
            const input = createFixture();
            const before = snapshot(input);

            if ((random() & 1) === 0) {
                const replacement = values[random() % values.length];
                const actual = setPathValue(input, path, replacement);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    continue;
                }
                const expected = referenceSet(input, path, replacement);
                expect(snapshot(actual.value)).toEqual(snapshot(expected));
            } else {
                const actual = deletePathValue(input, path);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    continue;
                }
                const expected = referenceDelete(input, path);
                expect(snapshot(actual.value)).toEqual(snapshot(expected));
            }

            expect(snapshot(input)).toEqual(before);
        }
    });
});

function mutationPaths(): readonly FieldPath[] {
    return [
        normalizePath('flag'),
        normalizePath(['profile', 'name']),
        normalizePath(['profile', 'tags', 0]),
        normalizePath(['profile', 'tags', 1]),
        normalizePath(['profile', 'tags', 4]),
        normalizePath(['orders', 0, 'total']),
        normalizePath(['orders', 2, 'total']),
        normalizePath(['metadata', 'count']),
        normalizePath(['created', 'nested', 3, 'label']),
    ];
}

function createFixture(): DataRecord {
    const metadata = Object.create(null) as Record<string, unknown>;
    defineField(metadata, 'count', 2);
    const tags = createSparseDataArray(3);
    tags[0] = 'first';
    tags[2] = 'third';
    return dataRecord({
        flag: true,
        metadata,
        orders: [{ total: 10 }, { total: 20 }],
        profile: { name: 'Ada', tags },
    });
}

function referenceSet(root: DataRecord, path: FieldPath, value: unknown): DataRecord {
    const clone = cloneFixture(root);
    let container = objectContainer(clone);
    for (let index = 0; index < path.length - 1; index += 1) {
        const segment = requiredSegment(path, index);
        const nextSegment = requiredSegment(path, index + 1);
        const existing = readReferenceField(container, segment);
        const child = !existing.found || existing.value === undefined
            ? createContainer(nextSegment)
            : existing.value;
        if (!existing.found || existing.value === undefined) {
            defineField(container, segment, child);
        }
        container = objectContainer(child);
    }
    defineField(container, requiredSegment(path, path.length - 1), value);
    return dataRecord(clone);
}

function referenceDelete(root: DataRecord, path: FieldPath): DataRecord {
    const clone = cloneFixture(root);
    let container = objectContainer(clone);
    for (let index = 0; index < path.length - 1; index += 1) {
        const existing = readReferenceField(
            container,
            requiredSegment(path, index),
        );
        if (!existing.found || existing.value === undefined || existing.value === null) {
            return dataRecord(clone);
        }
        container = objectContainer(existing.value);
    }
    Reflect.deleteProperty(container, requiredSegment(path, path.length - 1));
    return dataRecord(clone);
}

function cloneFixture(value: object): object;
function cloneFixture(value: unknown): unknown;
function cloneFixture(value: unknown): unknown {
    if (typeof value !== 'object' || value === null) {
        return value;
    }
    const clone: Record<PropertyKey, unknown> | unknown[] = isUnknownArray(value)
        ? createSparseDataArray(value.length)
        : Object.create(getObjectPrototype(value)) as Record<PropertyKey, unknown>;
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor !== undefined && 'value' in descriptor) {
            defineField(clone, key, cloneFixture(getDataPropertyValue(descriptor)));
        }
    }
    return clone;
}

function snapshot(value: unknown): unknown {
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
        return [key, snapshot(fieldValue)] as const;
    });
    return {
        entries,
        kind: Array.isArray(value)
            ? 'array'
            : Object.getPrototypeOf(value) === null ? 'null-record' : 'record',
        length: Array.isArray(value) ? value.length : undefined,
    };
}

function defineField(
    container: Record<PropertyKey, unknown> | unknown[],
    segment: PathSegment,
    value: unknown,
): void {
    Object.defineProperty(container, segment, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
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

function requiredItem<Value>(values: readonly Value[], index: number): Value {
    const value = values[index];
    if (value === undefined) {
        throw new TypeError('The reference corpus selected an invalid item.');
    }
    return value;
}

function deterministicRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = Math.imul(state, 1_664_525) + 1_013_904_223 >>> 0;
        return state;
    };
}

function dataRecord(value: object): DataRecord {
    return value as DataRecord;
}

function pathInput(segments: readonly string[]): PathInput {
    // The corpus deliberately constructs paths dynamically to exercise runtime validation.
    return segments as PathInput;
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

function capturePlanError(run: () => unknown): PlanError {
    try {
        run();
    } catch (error) {
        if (error instanceof PlanError) {
            return error;
        }
        throw error;
    }
    throw new Error('Expected path normalization to fail.');
}
