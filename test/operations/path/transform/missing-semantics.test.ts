import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep transform missing semantics', () => {
    it('treats absent and undefined values as missing and supports skipping them', () => {
        const required = spell<{ profile?: { value?: string | null | undefined } }>()
            .transform(['profile', 'value'], (value) => String(value))
            .build();
        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(required.safeRun({ profile: { value: undefined } })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'value'] }],
            ok: false,
        });

        const skipped = spell<{ profile?: { value?: string } }>()
            .transform(['profile', 'value'], (value) => value.toUpperCase(), { missing: 'skip' })
            .build();
        expect(skipped.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });
    });
});
