import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep set operation', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: 'Ada', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .set(['profile', 'name'], 'Grace', { id: 'set-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('Grace');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBe('Ada');
        expect(result.changes).toEqual([{
            kind: 'set',
            path: ['profile', 'name'],
            stepId: 'set-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'set-name',
            kind: 'set',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
        const [change] = result.changes;
        expect(change?.kind).toBe('set');
        if (change?.kind === 'set') {
            expect(Object.isFrozen(change.path)).toBe(true);
        }
    });

});
