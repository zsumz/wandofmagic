import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep transform failures', () => {
    it('reports callback failures without exposing values in metadata', () => {
        const secret = 'private-input';
        const cause = new Error('callback failed');
        const throwing = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], () => {
                throw cause;
            }, { id: 'failing-transform' })
            .build();
        const thrown = throwing.safeRun({ profile: { value: secret } });
        expect(thrown).toMatchObject({
            changes: [],
            issues: [{
                code: 'transform_failed',
                path: ['profile', 'value'],
                step: { id: 'failing-transform', kind: 'transform' },
            }],
            ok: false,
        });
        if (!thrown.ok) {
            expect(thrown.issues[0]?.cause).toBe(cause);
        }
        expect(JSON.stringify(throwing.describe())).not.toContain(secret);
        expect(JSON.stringify(thrown)).not.toContain(secret);

        const asyncTransform = (async (value: string) => {
            await Promise.resolve();
            return value;
        }) as unknown as
            (value: string) => string;
        const promised = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], asyncTransform)
            .build()
            .safeRun({ profile: { value: secret } });
        expect(promised).toMatchObject({
            changes: [],
            issues: [{ code: 'transform_failed', path: ['profile', 'value'] }],
            ok: false,
        });
    });
});
