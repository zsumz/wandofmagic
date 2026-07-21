import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

describe('deep transform writes', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: 'Ada', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .transform(['profile', 'name'], (name) => name.toUpperCase(), { id: 'upper-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('ADA');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBe('Ada');
        expect(result.changes).toEqual([{
            kind: 'transform',
            path: ['profile', 'name'],
            stepId: 'upper-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'upper-name',
            kind: 'transform',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
    });

    it('supports one-off wands', () => {
        expect(wand({ profile: { value: 2 } })
            .transform(['profile', 'value'], (value) => value * 3)
            .value()).toEqual({ profile: { value: 6 } });
    });
});
