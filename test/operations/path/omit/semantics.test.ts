import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep omit semantics', () => {
    it('deletes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ secret: 'private', stable, visible: true });
        const input = Object.freeze({ profile, settings: stable });
        const sanitize = spell<typeof input>()
            .omit([['profile', 'secret']], { id: 'omit-secret' })
            .build();

        const result = sanitize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect('secret' in result.value.profile).toBe(false);
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.secret).toBe('private');
        expect(result.changes).toEqual([{
            kind: 'omit',
            path: ['profile', 'secret'],
            stepId: 'omit-secret',
        }]);
        expect(sanitize.describe().steps).toEqual([{
            id: 'omit-secret',
            kind: 'omit',
            reads: [['profile', 'secret']],
            removes: [['profile', 'secret']],
            writes: [],
        }]);
        expect(JSON.stringify(result.changes)).not.toContain('private');
    });

});
