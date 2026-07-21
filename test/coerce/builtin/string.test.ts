import { describe, expect, it } from 'vitest';
import { string } from '../../../src/coerce/index.js';

describe('string coercer', () => {
    it('coerces only string-compatible primitives', () => {
        const coercer = string();

        expect(coercer.run('already')).toEqual({ ok: true, value: 'already' });
        expect(coercer.run(true)).toEqual({ ok: true, value: 'true' });
        expect(coercer.run(42)).toEqual({ ok: true, value: '42' });
        expect(coercer.run(42n)).toEqual({ ok: true, value: '42' });
        expect(coercer.run({})).toMatchObject({ ok: false });
        expect(coercer.run(Symbol('value'))).toMatchObject({ ok: false });
    });
});
