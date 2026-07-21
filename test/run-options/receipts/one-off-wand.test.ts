import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/index.js';
import { wand } from '../../../src/index.js';

describe('one-off wand receipts', () => {
    it('discards receipts for every vertical-slice operation', () => {
        const result = wand({ count: '2', first_name: ' Ada ', removable: true })
            .rename({ first_name: 'firstName' })
            .trim(['firstName'])
            .coerce('count', number({ integer: true }))
            .transform('count', (count) => count * 2)
            .default('active', false as const)
            .derive('label', ['firstName', 'count'], ([firstName, count]) =>
                `${firstName}:${String(count)}`)
            .omit(['removable'])
            .result({ receipt: 'discard' });

        expect(result).toEqual({
            changes: [],
            ok: true,
            value: {
                active: false,
                count: 4,
                firstName: 'Ada',
                label: 'Ada:4',
            },
        });
    });
});
