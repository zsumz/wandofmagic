import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep default defined values', () => {
    it('preserves null and defined falsy values without receipts or branch copies', () => {
        interface Input {
            profile: { value?: false | number | string | null };
        }
        const normalize = spell<Input>()
            .default(['profile', 'value'], 'fallback')
            .build();

        for (const selected of [null, false, 0, ''] as const) {
            const profile: Input['profile'] = { value: selected };
            const result = normalize.safeRun({ profile });
            expect(result).toMatchObject({ changes: [], ok: true });
            if (result.ok) {
                expect(result.value.profile).toBe(profile);
                expect(result.value.profile.value).toBe(selected);
            }
        }
    });
});
