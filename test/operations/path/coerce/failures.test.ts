import { describe, expect, it } from 'vitest';

import { defineCoercer } from '../../../../src/coerce/types.js';
import { spell } from '../../../../src/index.js';

describe('deep coerce failures', () => {
    it('reports coded and thrown failures without exposing input values', () => {
        const secret = 'private-input';
        const coded = defineCoercer<string, string>({
            name: 'coded',
            run: () => ({ code: 'not_ready', message: 'Not ready.', ok: false }),
        });
        const codedResult = spell<{ profile: { value: string } }>()
            .coerce(['profile', 'value'], coded, { id: 'coded-step' })
            .build()
            .safeRun({ profile: { value: secret } });
        expect(codedResult).toMatchObject({
            changes: [],
            issues: [{
                code: 'coercion_failed',
                details: { coercer: 'coded', coercerCode: 'not_ready' },
                path: ['profile', 'value'],
                step: { id: 'coded-step', kind: 'coerce' },
            }],
            ok: false,
        });
        expect(JSON.stringify(codedResult)).not.toContain(secret);

        const cause = new Error('coercer failed');
        const throwing = defineCoercer<string, string>({
            name: 'throwing',
            run: () => {
                throw cause;
            },
        });
        const thrown = spell<{ profile: { value: string } }>()
            .coerce(['profile', 'value'], throwing)
            .build()
            .safeRun({ profile: { value: secret } });
        expect(thrown).toMatchObject({
            changes: [],
            issues: [{ code: 'coercion_failed', path: ['profile', 'value'] }],
            ok: false,
        });
        if (!thrown.ok) {
            expect(thrown.issues[0]?.cause).toBe(cause);
        }
    });
});
