import { describe, expect, it } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { spell } from '../../../../src/index.js';

describe('deep coerce missing semantics', () => {
    it('treats absent and undefined values as missing and supports skipping them', () => {
        const required = spell<{ profile?: { count?: string | number | undefined } }>()
            .coerce(['profile', 'count'], number())
            .build();
        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'count'] }],
            ok: false,
        });
        expect(required.safeRun({ profile: { count: undefined } })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'count'] }],
            ok: false,
        });

        const skipped = spell<{ profile?: { count?: string | number } }>()
            .coerce(['profile', 'count'], number(), { missing: 'skip' })
            .build();
        expect(skipped.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });
    });
});
