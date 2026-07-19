import { describe, expect, it } from 'vitest';
import { PlanError, spell } from '../src/index.js';
import { defineCoercer, number } from '../src/coerce/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('plan guardrails', () => {
    it('rejects empty operations', () => {
        expectPlanError(() => spell<{ value: string }>().rename({}), 'empty_operation');
        expectPlanError(() => spell<{ value: string }>().trim([]), 'empty_operation');
        expectPlanError(() => spell<{ value: string }>().omit([]), 'empty_operation');

        const emptyDependencies = [] as unknown as readonly ['value'];
        expectPlanError(
            () => spell<{ value: string }>().derive('next', emptyDependencies, () => 'value'),
            'empty_operation',
        );
    });

    it('rejects invalid and duplicate step IDs', () => {
        expectPlanError(
            () => spell<{ value: string }>().trim(['value'], { id: 'not valid' }),
            'invalid_step_id',
        );

        expectPlanError(
            () =>
                spell<{ value: string }>()
                    .trim(['value'], { id: 'normalize' })
                    .transform('value', (value) => value, { id: 'normalize' }),
            'duplicate_step_id',
        );
    });

    it('retains useful PlanError metadata', () => {
        const error = new PlanError('dangerous_key', 'Nope');
        expect(error).toMatchObject({ code: 'dangerous_key', message: 'Nope', name: 'PlanError' });
    });
});

describe('operation edge semantics', () => {
    it('handles no-op and absent renames without allocating changes', () => {
        const identity = spell<{ value?: string }>().rename({ value: 'value' }).build();
        expect(identity.safeRun({ value: 'same' })).toMatchObject({ changes: [], ok: true });
        expect(identity.safeRun({})).toMatchObject({ changes: [], ok: true });
    });

    it('handles nullable, absent, clean, and invalid trim values', () => {
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

    it('supports transform success, identity, skip, missing, and thrown failures', () => {
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

    it('rejects promise-like transform and derive outputs at the runtime boundary', () => {
        const asyncTransform = (async (value: string) => Promise.resolve(value.toUpperCase())) as unknown as
            (value: string) => string;
        const transformed = spell<{ value: string }>()
            .transform('value', asyncTransform)
            .build()
            .safeRun({ value: 'hello' });
        expect(transformed).toMatchObject({
            issues: [{ code: 'transform_failed' }],
            ok: false,
        });

        const asyncDerive = (async ([value]: readonly [string]) => Promise.resolve(value.toUpperCase())) as unknown as
            (values: readonly [string]) => string;
        const derived = spell<{ value: string }>()
            .derive('label', ['value'], asyncDerive)
            .build()
            .safeRun({ value: 'hello' });
        expect(derived).toMatchObject({
            issues: [{ code: 'transform_failed' }],
            ok: false,
        });
    });

    it('supports coercer missing, no-op, coded, and thrown outcomes', () => {
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

    it('reports derive conflicts, missing dependencies, and callback failures', () => {
        const derive = spell<{ source?: string }>()
            .derive('target', ['source'], ([source]) => source.toUpperCase())
            .build();

        expect(
            derive.safeRun({ source: 'x', target: 'existing' } as { source?: string }),
        ).toMatchObject({ issues: [{ code: 'destination_conflict' }], ok: false });
        expect(derive.safeRun({})).toMatchObject({ issues: [{ code: 'missing_field' }], ok: false });

        const throwing = spell<{ source: string }>()
            .derive('target', ['source'], () => {
                throw new Error('derive exploded');
            })
            .build();
        expect(throwing.safeRun({ source: 'x' })).toMatchObject({
            issues: [{ code: 'transform_failed' }],
            ok: false,
        });
    });

    it('treats omitting absent fields as a no-op and deduplicates keys', () => {
        const omit = spell<{ keep: string; missing?: string }>().omit(['missing', 'missing']).build();

        expect(omit.safeRun({ keep: 'yes' })).toMatchObject({ changes: [], ok: true });
        expect(omit.run({ keep: 'yes', missing: 'remove' })).toEqual({ keep: 'yes' });
    });
});
