import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('transform missing-value semantics', () => {
    it('passes null to transforms', () => {
        const normalize = spell<{ value: null }>()
            .transform('value', (value) => `transformed-${String(value)}`)
            .build();

        expect(normalize.run({ value: null })).toEqual({ value: 'transformed-null' });
    });

    it('treats undefined as missing according to policy', () => {
        const required = spell<{ value?: string | undefined }>()
            .transform('value', (value) => value)
            .build();
        expect(required.safeRun({ value: undefined })).toMatchObject({
            issues: [{ code: 'missing_field' }],
            ok: false,
        });

        const skipped = spell<{ value?: string | undefined }>()
            .transform('value', (value) => value, { missing: 'skip' })
            .build();
        expect(skipped.run({ value: undefined })).toEqual({ value: undefined });
    });
});
