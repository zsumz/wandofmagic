import { describe, expect, it } from 'vitest';

import { deletePathValue } from '../../src/runtime/path/delete-path-value.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { setPathValue } from '../../src/runtime/path/set-path-value.js';
import { dataRecord } from './test-support.js';

describe('copy-on-write mutation guardrails', () => {
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
