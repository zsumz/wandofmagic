import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('trim semantics', () => {
    it('handles absent, nullable, clean, and invalid values', () => {
        const normalize = spell<{ value?: string | null | undefined }>().trim(['value']).build();

        expect(normalize.safeRun({})).toMatchObject({ changes: [], ok: true });
        expect(normalize.safeRun({ value: undefined })).toMatchObject({ changes: [], ok: true });
        expect(normalize.safeRun({ value: null })).toMatchObject({ changes: [], ok: true });
        expect(normalize.safeRun({ value: 'clean' })).toMatchObject({ changes: [], ok: true });
        expect(normalize.safeRun({ value: 42 } as unknown as { value?: string | null })).toMatchObject({
            issues: [{ code: 'unexpected_type', path: ['value'] }],
            ok: false,
        });
    });
});
