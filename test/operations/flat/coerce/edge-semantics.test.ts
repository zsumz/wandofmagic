import { describe, expect, it } from 'vitest';
import { defineCoercer, number } from '../../../../src/coerce/index.js';
import { spell } from '../../../../src/index.js';

describe('coerce edge semantics', () => {
    it('supports missing, no-op, coded, and thrown outcomes', () => {
        const required = spell<{ value?: string }>().coerce('value', number()).build();
        expect(required.safeRun({})).toMatchObject({ issues: [{ code: 'missing_field' }], ok: false });

        const noOp = spell<{ value: number }>().coerce('value', number()).build();
        expect(noOp.safeRun({ value: 3 })).toMatchObject({ changes: [], ok: true });

        const coded = defineCoercer<string, string>({
            name: 'coded',
            run: () => ({ code: 'not_ready', message: 'Not ready', ok: false }),
        });
        expect(
            spell<{ value: string }>().coerce('value', coded).build().safeRun({ value: 'x' }),
        ).toMatchObject({
            issues: [{ details: { coercer: 'coded', coercerCode: 'not_ready' } }],
            ok: false,
        });

        const throwing = defineCoercer<string, string>({
            name: 'throwing',
            run: () => {
                throw new Error('coercer exploded');
            },
        });
        const result = spell<{ value: string }>()
            .coerce('value', throwing)
            .build()
            .safeRun({ value: 'x' });
        expect(result).toMatchObject({ issues: [{ code: 'coercion_failed' }], ok: false });
        if (!result.ok) {
            expect(result.issues[0]?.cause).toBeInstanceOf(Error);
        }
    });
});
