import { describe, expect, it } from 'vitest';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { readPath } from '../../../src/runtime/path/read-path.js';

describe('checked path reads', () => {
    it('reads nested own data through plain, null-prototype, and frozen containers', () => {
        const profile = Object.assign(Object.create(null) as object, { name: 'Ada' });
        const root = Object.freeze({ account: Object.freeze({ profile }) });

        expect(readPath(root, normalizePath(['account', 'profile', 'name']))).toEqual({
            status: 'found',
            value: 'Ada',
        });
        expect(readPath(root, normalizePath(['account', 'missing']))).toEqual({
            status: 'missing',
        });
    });

    it('treats absent properties, undefined parents, and sparse indices as missing', () => {
        const rows = new Array(3) as Array<{ value: string } | undefined>;
        rows[2] = { value: 'present' };
        const root = { optional: undefined, rows };

        expect(readPath(root, normalizePath(['optional', 'value']))).toEqual({ status: 'missing' });
        expect(readPath(root, normalizePath(['rows', 0, 'value']))).toEqual({ status: 'missing' });
        expect(readPath(root, normalizePath(['rows', 2, 'value']))).toEqual({
            status: 'found',
            value: 'present',
        });
    });
});
