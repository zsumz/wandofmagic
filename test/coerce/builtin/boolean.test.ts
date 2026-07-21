import { describe, expect, it } from 'vitest';
import { boolean } from '../../../src/coerce/index.js';

describe('boolean coercer', () => {
    it('coerces booleans conservatively', () => {
        const relaxed = boolean();

        expect(relaxed.run(true)).toEqual({ ok: true, value: true });
        expect(relaxed.run(false)).toEqual({ ok: true, value: false });
        expect(relaxed.run('TRUE')).toEqual({ ok: true, value: true });
        expect(relaxed.run('false')).toEqual({ ok: true, value: false });
        expect(relaxed.run('yes')).toMatchObject({ ok: false });
        expect(relaxed.run(1)).toMatchObject({ ok: false });

        const exact = boolean({ caseSensitive: true });
        expect(exact.run('true')).toEqual({ ok: true, value: true });
        expect(exact.run('TRUE')).toMatchObject({ ok: false });
    });
});
