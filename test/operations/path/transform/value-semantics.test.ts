import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep transform value semantics', () => {
    it('passes null to callbacks and preserves identity transformations', () => {
        const nullable = spell<{ profile: { value: string | null } }>()
            .transform(['profile', 'value'], (value) => String(value))
            .build();
        expect(nullable.run({ profile: { value: null } }).profile.value).toBe('null');

        const identity = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], (value) => value)
            .build();
        expect(identity.safeRun({ profile: { value: 'same' } }))
            .toMatchObject({ changes: [], ok: true });
    });
});
