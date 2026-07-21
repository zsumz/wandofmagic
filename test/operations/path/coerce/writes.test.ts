import { describe, expect, it } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { spell, wand } from '../../../../src/index.js';

describe('deep coerce writes', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ count: '7', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .coerce(['profile', 'count'], number(), { id: 'coerce-count' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.count).toBe(7);
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.count).toBe('7');
        expect(result.changes).toEqual([{
            coercer: 'number',
            fromType: 'string',
            kind: 'coerce',
            path: ['profile', 'count'],
            stepId: 'coerce-count',
            toType: 'number',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'coerce-count',
            kind: 'coerce',
            reads: [['profile', 'count']],
            removes: [],
            writes: [['profile', 'count']],
        }]);
    });

    it('supports one-off wands', () => {
        expect(wand({ profile: { count: '4' } })
            .coerce(['profile', 'count'], number())
            .value()).toEqual({ profile: { count: 4 } });
    });
});
