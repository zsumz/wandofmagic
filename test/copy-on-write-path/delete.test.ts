import { describe, expect, it } from 'vitest';
import { isUnknownArray } from '../../src/internal/type-boundary/array.js';
import { deletePathValue } from '../../src/runtime/path/delete-path-value.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { readPath } from '../../src/runtime/path/read-path.js';
import { dataRecord, ownValue } from './test-support.js';

describe('copy-on-write path delete', () => {
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
});
