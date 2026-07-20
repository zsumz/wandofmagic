import { describe, expect, it, vi } from 'vitest';

import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { spell, wand } from '../src/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('deep omit operation', () => {
    it('deletes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ secret: 'private', stable, visible: true });
        const input = Object.freeze({ profile, settings: stable });
        const sanitize = spell<typeof input>()
            .omit([['profile', 'secret']], { id: 'omit-secret' })
            .build();

        const result = sanitize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect('secret' in result.value.profile).toBe(false);
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.secret).toBe('private');
        expect(result.changes).toEqual([{
            kind: 'omit',
            path: ['profile', 'secret'],
            stepId: 'omit-secret',
        }]);
        expect(sanitize.describe().steps).toEqual([{
            id: 'omit-secret',
            kind: 'omit',
            reads: [['profile', 'secret']],
            removes: [['profile', 'secret']],
            writes: [],
        }]);
        expect(JSON.stringify(result.changes)).not.toContain('private');
    });

    it('preserves flat batches and supports mixed selectors and one-off wands', () => {
        const flat = spell<{ keep: boolean; secret: string }>()
            .omit(['secret'])
            .build()
            .run({ keep: true, secret: 'private' });
        expect(flat).toEqual({ keep: true });

        const mixed = spell<{ profile: { secret: string; visible: boolean }; token: string }>()
            .omit([['token'], ['profile', 'secret']])
            .build()
            .run({ profile: { secret: 'private', visible: true }, token: 'private' });
        expect(mixed).toEqual({ profile: { visible: true } });

        expect(wand({ profile: { secret: true, visible: true } })
            .omit([['profile', 'secret']])
            .value()).toEqual({ profile: { visible: true } });
    });

    it('tolerates missing and null parents but removes present undefined fields', () => {
        interface Input {
            profile?: { secret?: string | undefined } | null;
        }
        const sanitize = spell<Input>().omit([['profile', 'secret']]).build();

        expect(sanitize.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });
        expect(sanitize.safeRun({ profile: null }))
            .toMatchObject({ changes: [], ok: true, value: { profile: null } });
        const present = sanitize.safeRun({ profile: { secret: undefined } });
        expect(present).toMatchObject({
            changes: [{ kind: 'omit', path: ['profile', 'secret'] }],
            ok: true,
            value: { profile: {} },
        });
    });

    it('coalesces duplicates and lets ancestor selectors dominate descendants', () => {
        const sanitize = spell<{
            other: { hidden: boolean; visible: boolean };
            profile: { secret: string; visible: boolean };
        }>()
            .omit([
                ['profile', 'secret'],
                ['profile'],
                ['profile', 'secret'],
                ['other', 'hidden'],
            ], { id: 'canonical-omit' })
            .build();
        const result = sanitize.safeRun({
            other: { hidden: true, visible: true },
            profile: { secret: 'private', visible: true },
        });

        expect(result).toMatchObject({
            changes: [
                { path: ['profile'] },
                { path: ['other', 'hidden'] },
            ],
            ok: true,
            value: { other: { visible: true } },
        });
        expect(sanitize.describe().steps[0]).toMatchObject({
            removes: [['profile'], ['other', 'hidden']],
        });
    });

    it('preserves null prototypes and sparse-array positions', () => {
        const profile = Object.create(null) as { secret: string; visible: boolean };
        profile.secret = 'private';
        profile.visible = true;
        const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const output = spell<{ profile: typeof profile; rows: typeof rows }>()
            .omit([['profile', 'secret'], ['rows', 1]])
            .build()
            .run({ profile, rows });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.visible).toBe(true);
        expect('secret' in output.profile).toBe(false);
        expect(output.rows).toHaveLength(3);
        expect(1 in output.rows).toBe(false);
        expect(output.rows[2]).toBe(rows[2]);
    });

    it('rolls back staged deletions when a later path fails without invoking getters', () => {
        const getter = vi.fn(() => 'private');
        const settings = Object.defineProperty({ visible: true }, 'computed', {
            enumerable: true,
            get: getter,
        });
        const input = { profile: { secret: 'still-present' }, settings };
        const result = spell<{
            profile: { secret: string };
            settings: { visible: boolean };
        }>()
            .omit([['profile', 'secret'], ['settings', 'visible']], { id: 'atomic-omit' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['settings', 'computed'],
                step: { id: 'atomic-omit', kind: 'omit' },
            }],
            ok: false,
        });
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.secret).toBe('still-present');
        expect(input.settings.visible).toBe(true);
    });

    it('rejects cycles and unsafe paths and fails closed in the static compiler', () => {
        interface Cyclic {
            self?: Cyclic;
            secret?: string;
        }
        const node: Cyclic = { secret: 'private' };
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .omit([['node', 'self', 'secret']])
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        // Deliberately bypass the strict API to prove the runtime plan guard.
        const dangerous = ['node', 'constructor'] as unknown as readonly ['node', 'secret'];
        expectPlanError(
            () => spell<{ node: Cyclic }>().omit([dangerous]),
            'dangerous_key',
        );
        const deep = spell<{ node: Cyclic }>().omit([['node', 'secret']]).build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});
