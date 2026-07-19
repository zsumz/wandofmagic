import { describe, expect, it } from 'vitest';
import {
    boolean as booleanCoercer,
    isoDate,
    number as numberCoercer,
    string as stringCoercer,
} from '../src/coerce/index.js';
import { spell } from '../src/index.js';

describe('built-in coercers', () => {
    it('coerces booleans conservatively', () => {
        const relaxed = booleanCoercer();

        expect(relaxed.run(true)).toEqual({ ok: true, value: true });
        expect(relaxed.run(false)).toEqual({ ok: true, value: false });
        expect(relaxed.run('TRUE')).toEqual({ ok: true, value: true });
        expect(relaxed.run('false')).toEqual({ ok: true, value: false });
        expect(relaxed.run('yes')).toMatchObject({ ok: false });
        expect(relaxed.run(1)).toMatchObject({ ok: false });

        const exact = booleanCoercer({ caseSensitive: true });
        expect(exact.run('true')).toEqual({ ok: true, value: true });
        expect(exact.run('TRUE')).toMatchObject({ ok: false });
    });

    it('coerces only string-compatible primitives', () => {
        const coercer = stringCoercer();

        expect(coercer.run('already')).toEqual({ ok: true, value: 'already' });
        expect(coercer.run(true)).toEqual({ ok: true, value: 'true' });
        expect(coercer.run(42)).toEqual({ ok: true, value: '42' });
        expect(coercer.run(42n)).toEqual({ ok: true, value: '42' });
        expect(coercer.run({})).toMatchObject({ ok: false });
        expect(coercer.run(Symbol('value'))).toMatchObject({ ok: false });
    });

    it('accepts explicit decimal numbers and rejects JavaScript conveniences', () => {
        const decimal = numberCoercer();

        expect(decimal.run(12)).toEqual({ ok: true, value: 12 });
        expect(decimal.run('-.5e2')).toEqual({ ok: true, value: -50 });
        expect(decimal.run('12.')).toEqual({ ok: true, value: 12 });
        expect(decimal.run({})).toMatchObject({ ok: false });
        expect(decimal.run('')).toMatchObject({ ok: false });
        expect(decimal.run('Infinity')).toMatchObject({ ok: false });
        expect(decimal.run(Number.POSITIVE_INFINITY)).toMatchObject({ ok: false });
        expect(decimal.run(Number.NaN)).toMatchObject({ ok: false });

        const integer = numberCoercer({ integer: true });
        expect(integer.name).toBe('integer');
        expect(integer.run('2')).toEqual({ ok: true, value: 2 });
        expect(integer.run('2.5')).toMatchObject({ ok: false });
    });

    it('accepts valid dates and explicit RFC 3339 timestamps', () => {
        const coercer = isoDate();
        const source = new Date('2024-02-29T12:30:45.123Z');
        const copied = coercer.run(source);

        expect(copied).toMatchObject({ ok: true });
        if (copied.ok) {
            expect(copied.value).not.toBe(source);
            expect(copied.value.getTime()).toBe(source.getTime());
        }

        expect(coercer.run('2024-02-29T12:30:45.123Z')).toMatchObject({ ok: true });
        expect(coercer.run('2000-02-29T00:00:00+23:59')).toMatchObject({ ok: true });
        expect(coercer.run('2026-01-31T23:59:59-05:30')).toMatchObject({ ok: true });
        expect(coercer.run('2026-04-30T00:00:00Z')).toMatchObject({ ok: true });
    });

    it.each([
        ['invalid Date', new Date(Number.NaN)],
        ['non-string', 42],
        ['missing timezone', '2026-01-01T00:00:00'],
        ['non-leap day', '2023-02-29T00:00:00Z'],
        ['non-leap century', '1900-02-29T00:00:00Z'],
        ['month zero', '2026-00-01T00:00:00Z'],
        ['month thirteen', '2026-13-01T00:00:00Z'],
        ['day zero', '2026-01-00T00:00:00Z'],
        ['31st in a 30-day month', '2026-04-31T00:00:00Z'],
        ['hour 24', '2026-01-01T24:00:00Z'],
        ['minute 60', '2026-01-01T00:60:00Z'],
        ['second 60', '2026-01-01T00:00:60Z'],
        ['offset hour 24', '2026-01-01T00:00:00+24:00'],
        ['offset minute 60', '2026-01-01T00:00:00+00:60'],
    ])('rejects %s', (_label, input) => {
        expect(isoDate().run(input)).toMatchObject({ ok: false });
    });
});

describe('coercer construction snapshots', () => {
    it('captures built-in option values once', () => {
        const numberOptions: { integer?: boolean } = { integer: true };
        const integer = numberCoercer(numberOptions);
        numberOptions.integer = false;
        expect(integer.run('1.5')).toMatchObject({ ok: false });

        const booleanOptions: { caseSensitive?: boolean } = { caseSensitive: true };
        const strictBoolean = booleanCoercer(booleanOptions);
        booleanOptions.caseSensitive = false;
        expect(strictBoolean.run('TRUE')).toMatchObject({ ok: false });
    });

    it('captures a custom coercer name and implementation when the step is created', () => {
        const mutable = {
            name: 'stable-coercer',
            run: (value: unknown) => ({ ok: true as const, value: `${String(value)}!` }),
        };
        const normalize = spell<{ value: string }>().coerce('value', mutable).build();
        mutable.name = 'mutated-coercer';
        mutable.run = () => ({ ok: true as const, value: 'mutated' });

        expect(normalize.safeRun({ value: 'original' })).toMatchObject({
            changes: [{ coercer: 'stable-coercer' }],
            ok: true,
            value: { value: 'original!' },
        });
    });
});
