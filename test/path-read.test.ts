import { describe, expect, it } from 'vitest';

import { normalizePath } from '../src/runtime/normalize-path.js';
import { readPath } from '../src/runtime/read-path.js';

describe('checked deep path reads', () => {
    it('reads nested own data through plain, null-prototype, and frozen containers', () => {
        const profile = Object.assign(createNullPrototype(), { name: 'Ada' });
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
        const rows = createSparseRows(3);
        rows[2] = { value: 'present' };
        const root = { optional: undefined, rows };

        expect(readPath(root, normalizePath(['optional', 'value']))).toEqual({ status: 'missing' });
        expect(readPath(root, normalizePath(['rows', 0, 'value']))).toEqual({ status: 'missing' });
        expect(readPath(root, normalizePath(['rows', 2, 'value']))).toEqual({
            status: 'found',
            value: 'present',
        });
    });

    it('never executes a nested getter', () => {
        let getterCalls = 0;
        const profile = Object.defineProperty({}, 'secret', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'hidden';
            },
        });

        expect(readPath({ profile }, normalizePath(['profile', 'secret']))).toMatchObject({
            issue: { code: 'unsupported_accessor', path: ['profile', 'secret'] },
            status: 'failed',
        });
        expect(getterCalls).toBe(0);
    });

    it('rejects inherited fields, opaque containers, and segment/container mismatches', () => {
        const inherited = createNonPlainObject({ value: 'inherited' });

        expect(readPath({ inherited }, normalizePath(['inherited', 'value']))).toMatchObject({
            issue: { code: 'unexpected_type', path: ['inherited'] },
            status: 'failed',
        });
        expect(readPath({ date: new Date() }, normalizePath(['date', 'year']))).toMatchObject({
            issue: { code: 'unexpected_type', path: ['date'] },
            status: 'failed',
        });
        expect(readPath({ rows: ['value'] }, normalizePath(['rows', '0']))).toMatchObject({
            issue: { code: 'unexpected_type', path: ['rows', '0'] },
            status: 'failed',
        });
        expect(readPath({ record: { value: true } }, normalizePath(['record', 0])))
            .toMatchObject({ issue: { code: 'unexpected_type' }, status: 'failed' });
    });

    it('rejects cycles and converts throwing reflection into a value-free issue', () => {
        const cyclic: { self?: unknown } = {};
        cyclic.self = cyclic;
        const hostile = new Proxy({}, {
            getOwnPropertyDescriptor() {
                throw new Error('private trap detail');
            },
        });

        expect(readPath({ cyclic }, normalizePath(['cyclic', 'self', 'value']))).toMatchObject({
            issue: { code: 'invalid_input', path: ['cyclic', 'self'] },
            status: 'failed',
        });
        const reflected = readPath({ hostile }, normalizePath(['hostile', 'value']));
        expect(reflected).toMatchObject({ issue: { code: 'invalid_input' }, status: 'failed' });
        expect(JSON.stringify(reflected)).not.toContain('private trap detail');
    });
});

function createNullPrototype(): object {
    return Object.create(null) as object;
}

function createNonPlainObject(prototype: object): object {
    return Object.create(prototype) as object;
}

function createSparseRows(length: number): Array<{ value: string } | undefined> {
    return new Array(length) as Array<{ value: string } | undefined>;
}
