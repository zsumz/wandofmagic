import { describe, expect, it } from 'vitest';

import { spell, wand } from '../src/index.js';
import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import type { PathInput } from '../src/core/path.js';
import { expectPlanError } from './expect-plan-error.js';

describe('deep set operation', () => {
    it('writes atomically with full-path metadata and branch identity preservation', () => {
        const stable = Object.freeze({ retained: true });
        const profile = Object.freeze({ name: 'Ada', stable });
        const input = Object.freeze({ profile, settings: stable });
        const normalize = spell<typeof input>()
            .set(['profile', 'name'], 'Grace', { id: 'set-name' })
            .build();

        const result = normalize.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value.profile.name).toBe('Grace');
        expect(result.value.profile).not.toBe(profile);
        expect(result.value.profile.stable).toBe(stable);
        expect(result.value.settings).toBe(stable);
        expect(input.profile.name).toBe('Ada');
        expect(result.changes).toEqual([{
            kind: 'set',
            path: ['profile', 'name'],
            stepId: 'set-name',
        }]);
        expect(normalize.describe().steps).toEqual([{
            id: 'set-name',
            kind: 'set',
            reads: [['profile', 'name']],
            removes: [],
            writes: [['profile', 'name']],
        }]);
        const [change] = result.changes;
        expect(change?.kind).toBe('set');
        if (change?.kind === 'set') {
            expect(Object.isFrozen(change.path)).toBe(true);
        }
    });

    it('creates missing parents and sparse arrays, and composes with flat operations', () => {
        const output = spell<{ id: string }>()
            .set(['order', 'items', 3, 'sku'], 'ABC')
            .set('active', false)
            .build()
            .run({ id: 'order-1' });

        expect(output).toMatchObject({ active: false, id: 'order-1' });
        expect(output.order.items).toHaveLength(4);
        expect(output.order.items[3]).toEqual({ sku: 'ABC' });
        expect(0 in output.order.items).toBe(false);
        expect(wand({}).set('label', '  ready  ').trim(['label']).value())
            .toEqual({ label: 'ready' });
    });

    it('suppresses Object.is no-ops and never includes the replacement in metadata', () => {
        const replacement = Object.freeze({ token: 'private-value' });
        const normalize = spell<{ metadata: typeof replacement }>()
            .set(['metadata'], replacement)
            .build();
        const result = normalize.safeRun({ metadata: replacement });

        expect(result).toMatchObject({ changes: [], ok: true });
        expect(JSON.stringify(normalize.describe())).not.toContain('private-value');
        expect(JSON.stringify(result.changes)).not.toContain('private-value');
    });

    it('attaches the set step to path failures without mutating input or invoking accessors', () => {
        let getterCalls = 0;
        const profile = Object.defineProperty({ name: 'Ada' }, 'private', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'secret';
            },
        });
        const input = { profile };
        const normalize = spell<typeof input>()
            .set(['profile', 'name'], 'Grace', { id: 'safe-set' })
            .build();
        const result = normalize.safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-set', kind: 'set' },
            }],
            ok: false,
        });
        expect(getterCalls).toBe(0);
        expect(input.profile.name).toBe('Ada');
    });

    it('rejects unsafe paths at plan time and fails closed in the static flat compiler', () => {
        const dangerous = ['profile', 'constructor'] as unknown as PathInput;
        expectPlanError(() => spell<Record<string, unknown>>().set(dangerous, true), 'dangerous_key');

        const deep = spell<{ value: string }>().set(['metadata', 'source'], 'api').build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});
