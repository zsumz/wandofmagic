import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep default data-model behavior', () => {
    it('supports null-prototype containers and rejects null parents', () => {
        const profile = Object.create(null) as { role?: string };
        const output = spell<{ profile: typeof profile }>()
            .default(['profile', 'role'], 'user')
            .build()
            .run({ profile });
        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.role).toBe('user');

        const failed = spell<{ profile: { role?: string } | null }>()
            .default(['profile', 'role'], 'user')
            .build()
            .safeRun({ profile: null });
        expect(failed).toMatchObject({
            changes: [],
            issues: [{ code: 'unexpected_type', path: ['profile'] }],
            ok: false,
        });
    });
});
