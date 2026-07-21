import { describe, expect, it } from 'vitest';
import { wand } from '../../src/index.js';

describe('one-off wand DX', () => {
    it('exposes the full vertical slice without changing execution semantics', () => {
        const result = wand({ count: 2, first_name: 'Ada', removable: true })
            .rename({ first_name: 'firstName' })
            .transform('count', (count) => count * 2)
            .default('active', true as const)
            .derive('label', ['firstName', 'count'], ([firstName, count]) => `${firstName}:${String(count)}`)
            .omit(['removable'])
            .result();

        expect(result).toMatchObject({
            changes: [
                { kind: 'rename' },
                { kind: 'transform' },
                { kind: 'default' },
                { kind: 'derive' },
                { kind: 'omit' },
            ],
            ok: true,
            value: {
                active: true,
                count: 4,
                firstName: 'Ada',
                label: 'Ada:4',
            },
        });
    });

    it('can compile a one-off chain into a reusable spell', () => {
        const reusable = wand({ value: '  first  ' }).trim(['value']).build();

        expect(reusable.run({ value: '  second  ' })).toEqual({ value: 'second' });
    });
});
