import { describe, expect, it, vi } from 'vitest';

import { defineCoercer } from '../src/coerce/types.js';
import { number } from '../src/coerce/number.js';
import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { spell, wand } from '../src/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('deep coerce operation', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ count: '7', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .coerce(['profile', 'count'], number(), { id: 'coerce-count' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.count).toBe(7);
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.count).toBe('7');
        expect(result.changes).toEqual([{
            coercer: 'number',
            fromType: 'string',
            kind: 'coerce',
            path: ['profile', 'count'],
            stepId: 'coerce-count',
            toType: 'number',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'coerce-count',
            kind: 'coerce',
            reads: [['profile', 'count']],
            removes: [],
            writes: [['profile', 'count']],
        }]);
    });

    it('preserves missing, undefined, null, identity, and wand semantics', () => {
        const required = spell<{ profile?: { count?: string | number | undefined } }>()
            .coerce(['profile', 'count'], number())
            .build();
        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'count'] }],
            ok: false,
        });
        expect(required.safeRun({ profile: { count: undefined } })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'count'] }],
            ok: false,
        });

        const skipped = spell<{ profile?: { count?: string | number } }>()
            .coerce(['profile', 'count'], number(), { missing: 'skip' })
            .build();
        expect(skipped.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });
        expect(skipped.safeRun({ profile: { count: 3 } }))
            .toMatchObject({ changes: [], ok: true });

        const nullCoercer = defineCoercer<null, 'null-value'>({
            name: 'null-value',
            run: (value) => value === null
                ? { ok: true, value: 'null-value' }
                : { message: 'Expected null.', ok: false },
        });
        expect(spell<{ profile: { value: null } }>()
            .coerce(['profile', 'value'], nullCoercer)
            .build()
            .run({ profile: { value: null } }).profile.value).toBe('null-value');
        expect(wand({ profile: { count: '4' } })
            .coerce(['profile', 'count'], number())
            .value()).toEqual({ profile: { count: 4 } });
    });

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

    it('captures coercer behavior when the plan is built', () => {
        const mutable = {
            name: 'captured',
            run: () => ({ ok: true as const, value: 1 }),
        };
        const normalize = spell<{ profile: { value: string } }>()
            .coerce(['profile', 'value'], mutable)
            .build();
        mutable.name = 'mutated';
        mutable.run = () => ({ ok: true, value: 2 });

        const result = normalize.safeRun({ profile: { value: 'input' } });
        expect(result).toMatchObject({
            changes: [{ coercer: 'captured' }],
            ok: true,
            value: { profile: { value: 1 } },
        });
    });

    it('supports null prototypes and sparse arrays without filling holes', () => {
        const profile = Object.create(null) as { counts: Array<{ value: string }> };
        const counts: Array<{ value: string }> = [];
        counts[3] = { value: '8' };
        profile.counts = counts;
        const output = spell<{ profile: typeof profile }>()
            .coerce(['profile', 'counts', 3, 'value'], number())
            .build()
            .run({ profile });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.counts).toHaveLength(4);
        expect(0 in output.profile.counts).toBe(false);
        expect(output.profile.counts[3]?.value).toBe(8);
    });

    it('does not invoke accessors or mutate input when a path cannot be committed', () => {
        const getter = vi.fn(() => 'secret');
        const profile = Object.defineProperty({ count: '9' }, 'private', {
            enumerable: true,
            get: getter,
        });
        const input = { profile };
        const result = spell<typeof input>()
            .coerce(['profile', 'count'], number(), { id: 'safe-coerce' })
            .build()
            .safeRun(input);
        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-coerce', kind: 'coerce' },
            }],
            ok: false,
        });
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.count).toBe('9');

        const selectedGetter = vi.fn(() => '10');
        const selectedRun = vi.fn(() => ({ ok: true as const, value: 10 }));
        const selectedCoercer = defineCoercer<string, number>({
            name: 'selected',
            run: selectedRun,
        });
        const selectedProfile = Object.defineProperty({} as { count: string }, 'count', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { count: string } }>()
            .coerce(['profile', 'count'], selectedCoercer)
            .build()
            .safeRun({ profile: selectedProfile });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'count'] }],
            ok: false,
        });
        expect(selectedRun).not.toHaveBeenCalled();
        expect(selectedGetter).not.toHaveBeenCalled();
    });

    it('rejects cycles and unsafe paths and fails closed in the static compiler', () => {
        interface Cyclic {
            self?: Cyclic;
            value: string;
        }
        const node: Cyclic = { value: '1' };
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .coerce(['node', 'self', 'value'], number())
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        const dangerous = ['profile', 'constructor'] as unknown as
            readonly ['profile', 'count'];
        expectPlanError(
            () => spell<{ profile: { count: string } }>().coerce(dangerous, number()),
            'dangerous_key',
        );
        const deep = spell<{ profile: { count: string } }>()
            .coerce(['profile', 'count'], number())
            .build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});
