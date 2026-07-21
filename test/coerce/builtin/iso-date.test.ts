import { describe, expect, it } from 'vitest';
import { isoDate } from '../../../src/coerce/index.js';

describe('ISO date coercer', () => {
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
