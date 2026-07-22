import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

describe('deep derive semantics', () => {
    it('derives a nested destination from mixed path dependencies', () => {
        const input = {
            prefix: 'Countess',
            profile: { first: 'Ada', last: 'Lovelace' },
        };
        const result = spell<typeof input>()
            .derive(
                ['profile', 'displayName'],
                ['prefix', ['profile', 'first'], ['profile', 'last']],
                ([prefix, first, last]) => `${prefix} ${first} ${last}`,
                { id: 'derive-display-name' },
            )
            .build()
            .safeRun(input);

        expect(result).toEqual({
            changes: [{
                kind: 'derive',
                path: ['profile', 'displayName'],
                sources: [['prefix'], ['profile', 'first'], ['profile', 'last']],
                stepId: 'derive-display-name',
            }],
            ok: true,
            value: {
                prefix: 'Countess',
                profile: {
                    displayName: 'Countess Ada Lovelace',
                    first: 'Ada',
                    last: 'Lovelace',
                },
            },
        });
        expect(input).toEqual({
            prefix: 'Countess',
            profile: { first: 'Ada', last: 'Lovelace' },
        });
    });

    it('supports one-off wands and newly constructed parents', () => {
        expect(wand({ first: 'Ada', last: 'Lovelace' })
            .derive(['summary', 'name'], ['first', 'last'], ([first, last]) => `${first} ${last}`)
            .value()).toEqual({
            first: 'Ada',
            last: 'Lovelace',
            summary: { name: 'Ada Lovelace' },
        });
    });

    it('keeps flat derivation source-compatible', () => {
        expect(spell<{ first: string; last: string }>()
            .derive('name', ['first', 'last'], ([first, last]) => `${first} ${last}`)
            .build()
            .run({ first: 'Ada', last: 'Lovelace' }))
            .toEqual({ first: 'Ada', last: 'Lovelace', name: 'Ada Lovelace' });
    });
});
