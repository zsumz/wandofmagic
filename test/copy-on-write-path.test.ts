import { describe, expect, it } from 'vitest';

import type { DataRecord } from '../src/core/data-record.js';
import {
    getDataPropertyValue,
    isUnknownArray,
} from '../src/internal/type-boundary.js';
import { deletePathValue } from '../src/runtime/delete-path-value.js';
import { normalizePath } from '../src/runtime/normalize-path.js';
import { readPath } from '../src/runtime/read-path.js';
import { setPathValue } from '../src/runtime/set-path-value.js';

describe('copy-on-write deep paths', () => {
    it('sets a frozen nested field while preserving untouched references and input', () => {
        const untouched = Object.freeze({ stable: true });
        const profile = Object.freeze({ name: 'Ada', untouched });
        const root = dataRecord(Object.freeze({ profile }));
        const result = setPathValue(root, normalizePath(['profile', 'name']), 'Grace');

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.changed).toBe(true);
        expect(result.value).not.toBe(root);
        expect(readPath(root, normalizePath(['profile', 'name']))).toMatchObject({ value: 'Ada' });
        expect(readPath(result.value, normalizePath(['profile', 'name'])))
            .toMatchObject({ value: 'Grace' });
        const outputProfile = ownValue(result.value, 'profile');
        expect(outputProfile).not.toBe(profile);
        expect(ownValue(asObject(outputProfile), 'untouched')).toBe(untouched);
    });

    it('returns the original root for an Object.is no-op', () => {
        const root = dataRecord({ profile: { score: Number.NaN } });
        const result = setPathValue(root, normalizePath(['profile', 'score']), Number.NaN);

        expect(result).toEqual({ changed: false, ok: true, value: root });
    });

    it('creates missing object parents and sparse arrays deterministically', () => {
        const root = dataRecord({});
        const result = setPathValue(
            root,
            normalizePath(['order', 'items', 3, 'sku']),
            'ABC',
        );

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(readPath(result.value, normalizePath(['order', 'items', 3, 'sku'])))
            .toEqual({ status: 'found', value: 'ABC' });
        const order = asObject(ownValue(result.value, 'order'));
        const items = ownValue(order, 'items');
        expect(isUnknownArray(items)).toBe(true);
        if (!isUnknownArray(items)) {
            return;
        }
        expect(items).toHaveLength(4);
        expect(0 in items).toBe(false);
        expect(1 in items).toBe(false);
        expect(2 in items).toBe(false);
    });

    it('deletes object fields and array indices without shifting later items', () => {
        const retained = Object.freeze({ id: 'third' });
        const root = dataRecord({
            profile: { secret: true, visible: true },
            rows: [{ id: 'first' }, { id: 'second' }, retained],
        });
        const withoutSecret = deletePathValue(root, normalizePath(['profile', 'secret']));
        expect(withoutSecret.ok).toBe(true);
        if (!withoutSecret.ok) {
            return;
        }
        expect(readPath(withoutSecret.value, normalizePath(['profile', 'secret'])))
            .toEqual({ status: 'missing' });
        expect(readPath(root, normalizePath(['profile', 'secret'])))
            .toMatchObject({ value: true });

        const withoutRow = deletePathValue(root, normalizePath(['rows', 1]));
        expect(withoutRow.ok).toBe(true);
        if (!withoutRow.ok) {
            return;
        }
        const rows = ownValue(withoutRow.value, 'rows');
        expect(isUnknownArray(rows)).toBe(true);
        if (!isUnknownArray(rows)) {
            return;
        }
        expect(rows).toHaveLength(3);
        expect(1 in rows).toBe(false);
        expect(rows[2]).toBe(retained);
    });

    it('preserves null prototypes and safely copies an own __proto__ sibling', () => {
        const profile = createNullPrototype();
        Object.defineProperty(profile, '__proto__', {
            configurable: true,
            enumerable: true,
            value: { safe: true },
            writable: true,
        });
        Object.defineProperty(profile, 'name', {
            configurable: true,
            enumerable: true,
            value: 'Ada',
            writable: true,
        });
        const root = dataRecord({ profile });
        const result = setPathValue(root, normalizePath(['profile', 'name']), 'Grace');

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        const outputProfile = asObject(ownValue(result.value, 'profile'));
        expect(Object.getPrototypeOf(outputProfile)).toBeNull();
        expect(ownValue(outputProfile, '__proto__')).toEqual({ safe: true });
    });

    it('rejects accessors and symbols in touched containers without executing getters', () => {
        let getterCalls = 0;
        const profile = Object.defineProperty({ name: 'Ada' }, 'computed', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'private';
            },
        });
        const accessorResult = setPathValue(
            dataRecord({ profile }),
            normalizePath(['profile', 'name']),
            'Grace',
        );
        expect(accessorResult).toMatchObject({
            issue: { code: 'unsupported_accessor' },
            ok: false,
        });
        expect(getterCalls).toBe(0);

        const symbol = Symbol('private');
        const symbolProfile = { name: 'Ada', [symbol]: 'hidden' };
        const symbolResult = setPathValue(
            dataRecord({ profile: symbolProfile }),
            normalizePath(['profile', 'name']),
            'Grace',
        );
        expect(symbolResult).toMatchObject({ issue: { code: 'invalid_input' }, ok: false });
        expect(JSON.stringify(symbolResult)).not.toContain('hidden');
    });

    it('rejects touched cycles, direct ancestor writes, and custom array properties', () => {
        const cyclic: { self?: unknown } = {};
        cyclic.self = cyclic;
        expect(setPathValue(
            dataRecord({ cyclic }),
            normalizePath(['cyclic', 'self', 'value']),
            true,
        )).toMatchObject({ issue: { code: 'invalid_input' }, ok: false });
        expect(deletePathValue(
            dataRecord({ cyclic }),
            normalizePath(['cyclic', 'self', 'value']),
        )).toMatchObject({ issue: { code: 'invalid_input' }, ok: false });

        const root = dataRecord({ profile: {} });
        expect(setPathValue(root, normalizePath(['profile', 'owner']), root))
            .toMatchObject({ issue: { code: 'invalid_input' }, ok: false });

        const rows = ['first'];
        Object.defineProperty(rows, 'custom', { enumerable: true, value: 'private' });
        const arrayResult = setPathValue(
            dataRecord({ rows }),
            normalizePath(['rows', 0]),
            'changed',
        );
        expect(arrayResult).toMatchObject({ issue: { code: 'invalid_input' }, ok: false });
        expect(JSON.stringify(arrayResult)).not.toContain('private');
    });

    it('rejects root arrays in both mutation primitives', () => {
        const root = dataRecord(['value']);
        const path = normalizePath('field');

        expect(setPathValue(root, path, true)).toMatchObject({
            issue: { code: 'invalid_input', path: ['field'] },
            ok: false,
        });
        expect(deletePathValue(root, path)).toMatchObject({
            issue: { code: 'invalid_input', path: ['field'] },
            ok: false,
        });
    });

    it('leaves the original root untouched after a failed deep mutation or missing delete', () => {
        const profile = Object.freeze({ name: 'Ada' });
        const root = dataRecord(Object.freeze({ profile }));
        const failed = setPathValue(root, normalizePath(['profile', 'name', 'first']), 'Grace');
        const missingDelete = deletePathValue(root, normalizePath(['profile', 'missing']));

        expect(failed).toMatchObject({ issue: { code: 'unexpected_type' }, ok: false });
        expect(root).toEqual({ profile: { name: 'Ada' } });
        expect(missingDelete).toEqual({ changed: false, ok: true, value: root });
    });
});

function dataRecord(value: object): DataRecord {
    return value as DataRecord;
}

function ownValue(value: object, key: string): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !('value' in descriptor)) {
        throw new Error(`Expected an own data property at ${key}.`);
    }
    return getDataPropertyValue(descriptor);
}

function asObject(value: unknown): object {
    if (typeof value !== 'object' || value === null) {
        throw new TypeError('Expected an object in the test fixture.');
    }
    return value;
}

function createNullPrototype(): object {
    return Object.create(null) as object;
}
