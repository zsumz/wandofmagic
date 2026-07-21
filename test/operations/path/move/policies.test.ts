import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('deep move policies', () => {
    it('distinguishes missing sources from present destination values', () => {
        const required = spell<{
            source?: string | undefined;
            target?: string | null | undefined;
        }>()
            .move('source', 'target')
            .build();

        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['source'] }],
            ok: false,
        });
        expect(required.safeRun({ source: undefined })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field' }],
            ok: false,
        });
        expect(required.safeRun({ source: 'private', target: undefined })).toMatchObject({
            changes: [],
            issues: [{ code: 'destination_conflict', path: ['target'] }],
            ok: false,
        });
    });

    it('applies skip, overwrite, and preserve policies', () => {
        const skipped = spell<{ source?: string | undefined }>()
            .move('source', 'target', { missing: 'skip' })
            .build();
        expect(skipped.safeRun({ source: undefined })).toMatchObject({
            changes: [],
            ok: true,
            value: { source: undefined },
        });

        const overwritten = spell<{ source: string; target: null }>()
            .move('source', 'target', { conflict: 'overwrite' })
            .build();
        expect(overwritten.run({ source: 'moved', target: null })).toEqual({ target: 'moved' });

        const preserved = spell<{ source: string; target: string }>()
            .move('source', 'target', { conflict: 'preserve' })
            .build();
        expect(preserved.safeRun({ source: 'source', target: 'target' })).toMatchObject({
            changes: [],
            ok: true,
            value: { source: 'source', target: 'target' },
        });
    });
});
