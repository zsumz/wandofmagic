import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/index.js';
import { spell, WandError } from '../../../src/index.js';

describe('failure receipts', () => {
    it('stops on the first failure and keeps only earlier collected changes', () => {
        let laterCalls = 0;
        const normalize = spell<{ count: string; first_name: string; later: string }>()
            .rename({ first_name: 'firstName' })
            .coerce('count', number())
            .transform('later', (value) => {
                laterCalls += 1;
                return value.toUpperCase();
            })
            .build();
        const input = { count: 'not-a-number', first_name: 'Ada', later: 'unreached' };

        const collected = normalize.safeRun(input);
        expect(collected).toMatchObject({
            changes: [{ kind: 'rename' }],
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
        if (!collected.ok) {
            expect(collected.issues).toHaveLength(1);
        }

        const discarded = normalize.safeRun(input, { receipt: 'discard' });
        expect(discarded).toMatchObject({
            changes: [],
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
        expect(laterCalls).toBe(0);

        try {
            normalize.run(input);
            throw new Error('Expected run() to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            if (error instanceof WandError) {
                expect(error.changes).toMatchObject([{ kind: 'rename' }]);
                expect(error.issues).toHaveLength(1);
            }
        }

        try {
            normalize.run(input, { receipt: 'discard' });
            throw new Error('Expected run() with discarded receipts to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            if (error instanceof WandError) {
                expect(error.changes).toEqual([]);
            }
        }
    });
});
