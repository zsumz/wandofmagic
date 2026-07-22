import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('path pick data model', () => {
    it('projects sparse array children without filling holes', () => {
        const rows: Array<{ id: string; private: string }> = [];
        rows.length = 3;
        rows[2] = { id: 'row-3', private: 'remove' };

        const value = spell<{ rows: Array<{ id: string; private: string }> }>()
            .pick([['rows', 2, 'id']])
            .build()
            .run({ rows });

        const expectedRows: Array<{ id: string }> = [];
        expectedRows.length = 3;
        expectedRows[2] = { id: 'row-3' };
        expect(value).toEqual({ rows: expectedRows });
        expect(0 in value.rows).toBe(false);
        expect(1 in value.rows).toBe(false);
    });

    it('preserves a null root prototype', () => {
        const input = Object.create(null) as { private: string; value: string };
        input.private = 'remove';
        input.value = 'kept';

        const value = spell<typeof input>().pick(['value']).build().run(input);
        expect(value).toEqual({ value: 'kept' });
        expect(Object.getPrototypeOf(value)).toBeNull();
    });

    it('fails atomically without executing nested accessors', () => {
        let reads = 0;
        const profile = { name: 'Ada' } as { name: string; secret?: string };
        Object.defineProperty(profile, 'secret', {
            enumerable: true,
            get() {
                reads += 1;
                return 'private';
            },
        });
        const result = spell<{ id: string; profile: typeof profile }>()
            .pick(['id', ['profile', 'secret']])
            .build()
            .safeRun({ id: 'kept', profile });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'secret'] }],
            ok: false,
        });
        expect(reads).toBe(0);
    });
});
