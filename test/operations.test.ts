import { describe, expect, it } from 'vitest';
import { PlanError, spell, WandError } from '../src/index.js';
import { defineCoercer, isoDate, number } from '../src/coerce/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('operation semantics', () => {
    it('performs rename swaps atomically', () => {
        const swap = spell<{ a: string; b: number }>().rename({ a: 'b', b: 'a' }).build();
        expect(swap.run({ a: 'left', b: 2 })).toEqual({ a: 2, b: 'left' });
    });

    it('reports destination conflicts instead of overwriting', () => {
        const normalize = spell<{ first_name: string; firstName?: string }>()
            .rename({ first_name: 'firstName' })
            .build();

        const result = normalize.safeRun({ first_name: 'Ada', firstName: 'Grace' });
        expect(result).toMatchObject({
            ok: false,
            issues: [{ code: 'destination_conflict', path: ['firstName'] }],
        });
    });

    it('distinguishes missing values from null defaults', () => {
        const withDefault = spell<{ nickname?: string | null | undefined }>()
            .default('nickname', 'Anonymous' as const)
            .build();

        expect(withDefault.run({})).toEqual({ nickname: 'Anonymous' });
        expect(withDefault.run({ nickname: undefined })).toEqual({ nickname: 'Anonymous' });
        expect(withDefault.run({ nickname: null })).toEqual({ nickname: null });
    });

    it('preserves optional fields when coercion skips missing values', () => {
        const normalize = spell<{ count?: string }>()
            .coerce('count', number(), { missing: 'skip' })
            .build();

        expect(normalize.run({})).toEqual({});
    });

    it('returns structured coercion failures', () => {
        const normalize = spell<{ count: string }>().coerce('count', number()).build();
        const result = normalize.safeRun({ count: 'nope' });

        expect(result).toMatchObject({
            changes: [],
            issues: [
                {
                    code: 'coercion_failed',
                    details: { coercer: 'number' },
                    path: ['count'],
                },
            ],
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

    it('requires stable custom coercer names', () => {
        expect(() =>
            defineCoercer<string, string>({
                name: 'not a stable name',
                run: (value) => ({ ok: true, value: String(value) }),
            }),
        ).toThrow(TypeError);
    });

    it('wraps safe failures in WandError for throwing execution', () => {
        const normalize = spell<{ count: string }>().coerce('count', number()).build();

        expect(() => normalize.run({ count: 'nope' })).toThrow(WandError);
    });

    it('rejects duplicate derive dependencies while building', () => {
        expectPlanError(
            () =>
                spell<{ firstName: string }>().derive(
                    'displayName',
                    ['firstName', 'firstName'],
                    ([firstName]) => firstName,
                ),
            'duplicate_dependency',
        );
    });

    it('rejects duplicate destinations while building', () => {
        expect(() => spell<{ a: string; b: string }>().rename({ a: 'value', b: 'value' })).toThrow(
            PlanError,
        );
    });
});
