import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/index.js';

describe('number coercer', () => {
    it('accepts explicit decimal numbers and rejects JavaScript conveniences', () => {
        const decimal = number();

        expect(decimal.run(12)).toEqual({ ok: true, value: 12 });
        expect(decimal.run('-.5e2')).toEqual({ ok: true, value: -50 });
        expect(decimal.run('12.')).toEqual({ ok: true, value: 12 });
        expect(decimal.run({})).toMatchObject({ ok: false });
        expect(decimal.run('')).toMatchObject({ ok: false });
        expect(decimal.run('Infinity')).toMatchObject({ ok: false });
        expect(decimal.run(Number.POSITIVE_INFINITY)).toMatchObject({ ok: false });
        expect(decimal.run(Number.NaN)).toMatchObject({ ok: false });

        const integer = number({ integer: true });
        expect(integer.name).toBe('integer');
        expect(integer.run('2')).toEqual({ ok: true, value: 2 });
        expect(integer.run('2.5')).toMatchObject({ ok: false });
    });
});
