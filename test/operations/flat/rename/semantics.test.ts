import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('rename semantics', () => {
    it('performs swaps atomically', () => {
        const swap = spell<{ a: string; b: number }>().rename({ a: 'b', b: 'a' }).build();
        expect(swap.run({ a: 'left', b: 2 })).toEqual({ a: 2, b: 'left' });
    });

    it('reports destination conflicts instead of overwriting', () => {
        const normalize = spell<{ first_name: string; firstName?: string }>()
            .rename({ first_name: 'firstName' })
            .build();

        const result = normalize.safeRun({ first_name: 'Ada', firstName: 'Grace' });
        expect(result).toMatchObject({
            ok: false,
            issues: [{ code: 'destination_conflict', path: ['firstName'] }],
        });
    });
});
