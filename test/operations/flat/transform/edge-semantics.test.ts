import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('transform edge semantics', () => {
    it('supports success, identity, skip, missing, and thrown failures', () => {
        const changed = spell<{ value: string }>()
            .transform('value', (value) => value.toUpperCase())
            .build();
        expect(changed.run({ value: 'hello' })).toEqual({ value: 'HELLO' });

        const identity = spell<{ value: string }>()
            .transform('value', (value) => value)
            .build();
        expect(identity.safeRun({ value: 'same' })).toMatchObject({ changes: [], ok: true });

        const skipped = spell<{ value?: string }>()
            .transform('value', (value) => value.toUpperCase(), { missing: 'skip' })
            .build();
        expect(skipped.safeRun({})).toMatchObject({ changes: [], ok: true });

        const required = spell<{ value?: string }>()
            .transform('value', (value) => value.toUpperCase())
            .build();
        expect(required.safeRun({})).toMatchObject({ issues: [{ code: 'missing_field' }], ok: false });

        const throwing = spell<{ value: string }>()
            .transform('value', () => {
                throw new Error('boom');
            })
            .build();
        const thrownResult = throwing.safeRun({ value: 'x' });
        expect(thrownResult).toMatchObject({ issues: [{ code: 'transform_failed' }], ok: false });
        if (!thrownResult.ok) {
            expect(thrownResult.issues[0]?.cause).toBeInstanceOf(Error);
        }
    });

    it('rejects promise-like callback outputs at the runtime boundary', () => {
        const asyncTransform = (async (value: string) => Promise.resolve(value.toUpperCase())) as unknown as
            (value: string) => string;
        const result = spell<{ value: string }>()
            .transform('value', asyncTransform)
            .build()
            .safeRun({ value: 'hello' });

        expect(result).toMatchObject({ issues: [{ code: 'transform_failed' }], ok: false });
    });
});
