import { describe, expect, it } from 'vitest';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { readPath } from '../../../src/runtime/path/read-path.js';

describe('checked path containers', () => {
    it('rejects inherited fields, opaque containers, and segment mismatches', () => {
        const inherited = Object.create({ value: 'inherited' }) as object;

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
});
