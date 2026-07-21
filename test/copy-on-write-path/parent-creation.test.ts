import { describe, expect, it } from 'vitest';
import { isUnknownArray } from '../../src/internal/type-boundary/array.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { readPath } from '../../src/runtime/path/read-path.js';
import { setPathValue } from '../../src/runtime/path/set-path-value.js';
import { asObject, dataRecord, ownValue } from './test-support.js';

describe('copy-on-write parent creation', () => {
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
});
