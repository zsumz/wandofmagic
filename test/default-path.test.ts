import { describe, expect, it, vi } from 'vitest';

import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { spell, wand } from '../src/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('deep default operation', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: undefined, stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .default(['profile', 'name'], 'Anonymous', { id: 'default-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('Anonymous');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBeUndefined();
        expect(result.changes).toEqual([{
            kind: 'default',
            path: ['profile', 'name'],
            stepId: 'default-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'default-name',
            kind: 'default',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
    });

    it('creates missing parents and sparse arrays and supports one-off wands', () => {
        const output = spell<Record<never, never>>()
            .default(['profile', 'role'], 'user')
            .default(['rows', 3, 'active'], true)
            .build()
            .run({});

        expect(output.profile.role).toBe('user');
        expect(output.rows).toHaveLength(4);
        expect(output.rows[3]).toEqual({ active: true });
        expect(0 in output.rows).toBe(false);
        expect(wand({ profile: {} }).default(['profile', 'role'], 'admin').value())
            .toEqual({ profile: { role: 'admin' } });
    });

    it('preserves null and defined falsy values without receipts or branch copies', () => {
        interface Input {
            profile: { value?: false | number | string | null };
        }
        const normalize = spell<Input>()
            .default(['profile', 'value'], 'fallback')
            .build();

        for (const selected of [null, false, 0, ''] as const) {
            const profile: Input['profile'] = { value: selected };
            const result = normalize.safeRun({ profile });
            expect(result).toMatchObject({ changes: [], ok: true });
            if (result.ok) {
                expect(result.value.profile).toBe(profile);
                expect(result.value.profile.value).toBe(selected);
            }
        }
    });

    it('does not expose fallback values in descriptions or receipts', () => {
        const fallback = Object.freeze({ token: 'private-fallback' });
        const normalize = spell<{ profile?: { metadata?: typeof fallback } }>()
            .default(['profile', 'metadata'], fallback)
            .build();
        const result = normalize.safeRun({});

        expect(result).toMatchObject({ changes: [{ kind: 'default' }], ok: true });
        expect(JSON.stringify(normalize.describe())).not.toContain('private-fallback');
        expect(JSON.stringify(result.changes)).not.toContain('private-fallback');
    });

    it('rejects touched accessors atomically without invoking getters', () => {
        const siblingGetter = vi.fn(() => 'secret');
        const profile = Object.defineProperty({}, 'private', {
            enumerable: true,
            get: siblingGetter,
        });
        const input = { profile };
        const result = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'ready', { id: 'safe-default' })
            .build()
            .safeRun(input);
        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-default', kind: 'default' },
            }],
            ok: false,
        });
        expect(siblingGetter).not.toHaveBeenCalled();
        expect('value' in profile).toBe(false);

        const selectedGetter = vi.fn(() => undefined);
        const selected = Object.defineProperty({}, 'value', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'ready')
            .build()
            .safeRun({ profile: selected });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(selectedGetter).not.toHaveBeenCalled();
    });

    it('supports null-prototype containers and rejects null parents', () => {
        const profile = Object.create(null) as { role?: string };
        const output = spell<{ profile: typeof profile }>()
            .default(['profile', 'role'], 'user')
            .build()
            .run({ profile });
        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.role).toBe('user');

        const failed = spell<{ profile: { role?: string } | null }>()
            .default(['profile', 'role'], 'user')
            .build()
            .safeRun({ profile: null });
        expect(failed).toMatchObject({
            changes: [],
            issues: [{ code: 'unexpected_type', path: ['profile'] }],
            ok: false,
        });
    });

    it('rejects cycles and unsafe paths and fails closed in the static compiler', () => {
        interface Cyclic {
            role?: string;
            self?: Cyclic;
        }
        const node: Cyclic = {};
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .default(['node', 'self', 'role'], 'user')
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        const dangerous = ['profile', 'constructor'] as unknown as readonly ['profile', 'role'];
        expectPlanError(
            () => spell<{ profile?: { role?: string } }>().default(dangerous, 'user'),
            'dangerous_key',
        );
        const deep = spell<{ profile?: { role?: string } }>()
            .default(['profile', 'role'], 'user')
            .build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});
