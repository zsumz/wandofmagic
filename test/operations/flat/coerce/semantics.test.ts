import { describe, expect, it } from 'vitest';
import { isoDate, number } from '../../../../src/coerce/index.js';
import { spell, WandError } from '../../../../src/index.js';

describe('coerce semantics', () => {
    it('preserves optional fields when missing values are skipped', () => {
        const normalize = spell<{ count?: string }>()
            .coerce('count', number(), { missing: 'skip' })
            .build();

        expect(normalize.run({})).toEqual({});
    });

    it('returns structured failures', () => {
        const normalize = spell<{ count: string }>().coerce('count', number()).build();
        const result = normalize.safeRun({ count: 'nope' });

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'coercion_failed',
                details: { coercer: 'number' },
                path: ['count'],
            }],
            ok: false,
        });
    });

    it('rejects JavaScript-specific numeric string syntax', () => {
        const normalize = spell<{ count: string }>().coerce('count', number()).build();

        expect(normalize.safeRun({ count: '0x10' })).toMatchObject({
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
        expect(normalize.run({ count: ' 1.5e2 ' })).toEqual({ count: 150 });
    });

    it('rejects impossible ISO calendar dates', () => {
        const normalize = spell<{ createdAt: string }>().coerce('createdAt', isoDate()).build();

        expect(normalize.safeRun({ createdAt: '2026-02-30T00:00:00Z' })).toMatchObject({
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
    });

    it('wraps safe failures in WandError for throwing execution', () => {
        const normalize = spell<{ count: string }>().coerce('count', number()).build();

        expect(() => normalize.run({ count: 'nope' })).toThrow(WandError);
    });
});
