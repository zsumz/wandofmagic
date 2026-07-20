import { describe, expect, it, vi } from 'vitest';

import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { spell, wand } from '../src/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('deep transform operation', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: 'Ada', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .transform(['profile', 'name'], (name) => name.toUpperCase(), { id: 'upper-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('ADA');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBe('Ada');
        expect(result.changes).toEqual([{
            kind: 'transform',
            path: ['profile', 'name'],
            stepId: 'upper-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'upper-name',
            kind: 'transform',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
    });

    it('preserves missing, undefined, null, identity, and wand semantics', () => {
        const required = spell<{ profile?: { value?: string | null | undefined } }>()
            .transform(['profile', 'value'], (value) => String(value))
            .build();
        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(required.safeRun({ profile: { value: undefined } })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(required.run({ profile: { value: null } }).profile.value).toBe('null');

        const skipped = spell<{ profile?: { value?: string } }>()
            .transform(['profile', 'value'], (value) => value.toUpperCase(), { missing: 'skip' })
            .build();
        expect(skipped.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });

        const identity = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], (value) => value)
            .build();
        expect(identity.safeRun({ profile: { value: 'same' } }))
            .toMatchObject({ changes: [], ok: true });

        expect(wand({ profile: { value: 2 } })
            .transform(['profile', 'value'], (value) => value * 3)
            .value()).toEqual({ profile: { value: 6 } });
    });

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

    it('supports null prototypes and sparse arrays without filling holes', () => {
        const profile = Object.create(null) as { scores: Array<{ value: number }> };
        const scores: Array<{ value: number }> = [];
        scores[3] = { value: 4 };
        profile.scores = scores;

        const output = spell<{ profile: typeof profile }>()
            .transform(['profile', 'scores', 3, 'value'], (value) => value + 1)
            .build()
            .run({ profile });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.scores).toHaveLength(4);
        expect(0 in output.profile.scores).toBe(false);
        expect(output.profile.scores[3]?.value).toBe(5);
    });

    it('does not invoke accessors or mutate input when a path cannot be committed', () => {
        const getter = vi.fn(() => 'secret');
        const callback = vi.fn((value: string) => value.toUpperCase());
        const profile = Object.defineProperty({ value: 'ready' }, 'private', {
            enumerable: true,
            get: getter,
        });
        const input = { profile };
        const result = spell<typeof input>()
            .transform(['profile', 'value'], callback, { id: 'safe-transform' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-transform', kind: 'transform' },
            }],
            ok: false,
        });
        expect(callback).toHaveBeenCalledOnce();
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.value).toBe('ready');

        const selectedGetter = vi.fn(() => 'selected-secret');
        const selectedCallback = vi.fn((value: string) => value.toUpperCase());
        const selectedProfile = Object.defineProperty({} as { value: string }, 'value', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], selectedCallback)
            .build()
            .safeRun({ profile: selectedProfile });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(selectedCallback).not.toHaveBeenCalled();
        expect(selectedGetter).not.toHaveBeenCalled();
    });

    it('rejects cycles and unsafe paths and fails closed in the static compiler', () => {
        interface Cyclic {
            label: string;
            self?: Cyclic;
        }
        const node: Cyclic = { label: 'root' };
        node.self = node;
        const callback = vi.fn((value: string) => value.toUpperCase());
        const result = spell<{ node: Cyclic }>()
            .transform(['node', 'self', 'label'], callback)
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });
        expect(callback).not.toHaveBeenCalled();

        const dangerous = ['profile', 'constructor'] as unknown as readonly ['profile', 'value'];
        expectPlanError(
            () => spell<{ profile: { value: string } }>().transform(dangerous, String),
            'dangerous_key',
        );

        const deep = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], (value) => value.toUpperCase())
            .build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});
