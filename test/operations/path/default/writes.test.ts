import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

describe('deep default writes', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: undefined, stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .default(['profile', 'name'], 'Anonymous', { id: 'default-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('Anonymous');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBeUndefined();
        expect(result.changes).toEqual([{
            kind: 'default',
            path: ['profile', 'name'],
            stepId: 'default-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'default-name',
            kind: 'default',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
    });

    it('creates missing parents and sparse arrays and supports one-off wands', () => {
        const output = spell<Record<never, never>>()
            .default(['profile', 'role'], 'user')
            .default(['rows', 3, 'active'], true)
            .build()
            .run({});

        expect(output.profile.role).toBe('user');
        expect(output.rows).toHaveLength(4);
        expect(output.rows[3]).toEqual({ active: true });
        expect(0 in output.rows).toBe(false);
        expect(wand({ profile: {} }).default(['profile', 'role'], 'admin').value())
            .toEqual({ profile: { role: 'admin' } });
    });
});
