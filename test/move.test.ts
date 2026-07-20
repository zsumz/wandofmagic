import { describe, expect, it, vi } from 'vitest';

import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { spell, wand } from '../src/index.js';
import { expectPlanError } from './expect-plan-error.js';

describe('move operation', () => {
    it('moves a nested value atomically with full-path metadata', () => {
        const stable = Object.freeze({ retained: true });
        const company = Object.freeze({ legalName: 'Acme', stable });
        const input = Object.freeze({ company, other: stable });
        const rename = spell<typeof input>()
            .move(['company', 'legalName'], ['company', 'name'], { id: 'move-name' })
            .build();

        const result = rename.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value).toEqual({ company: { name: 'Acme', stable }, other: stable });
        expect(result.value.company).not.toBe(company);
        expect(result.value.company.stable).toBe(stable);
        expect(result.value.other).toBe(stable);
        expect(input.company.legalName).toBe('Acme');
        expect(result.changes).toEqual([{
            from: ['company', 'legalName'],
            kind: 'move',
            stepId: 'move-name',
            to: ['company', 'name'],
        }]);
        expect(rename.describe().steps).toEqual([{
            id: 'move-name',
            kind: 'move',
            reads: [['company', 'legalName'], ['company', 'name']],
            removes: [['company', 'legalName']],
            writes: [['company', 'name']],
        }]);
        expect(JSON.stringify(result.changes)).not.toContain('Acme');
        expect(JSON.stringify(rename.describe())).not.toContain('Acme');
    });

    it('applies missing and conflict policies without confusing presence with value', () => {
        const required = spell<{
            source?: string | undefined;
            target?: string | null | undefined;
        }>()
            .move('source', 'target')
            .build();
        expect(required.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['source'] }],
            ok: false,
        });
        expect(required.safeRun({ source: undefined })).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field' }],
            ok: false,
        });
        expect(required.safeRun({ source: 'private', target: undefined })).toMatchObject({
            changes: [],
            issues: [{ code: 'destination_conflict', path: ['target'] }],
            ok: false,
        });

        const skipped = spell<{ source?: string | undefined }>()
            .move('source', 'target', { missing: 'skip' })
            .build();
        expect(skipped.safeRun({ source: undefined })).toMatchObject({
            changes: [],
            ok: true,
            value: { source: undefined },
        });

        const overwritten = spell<{ source: string; target: null }>()
            .move('source', 'target', { conflict: 'overwrite' })
            .build();
        expect(overwritten.run({ source: 'moved', target: null })).toEqual({ target: 'moved' });

        const preserved = spell<{ source: string; target: string }>()
            .move('source', 'target', { conflict: 'preserve' })
            .build();
        expect(preserved.safeRun({ source: 'source', target: 'target' })).toMatchObject({
            changes: [],
            ok: true,
            value: { source: 'source', target: 'target' },
        });
    });

    it('moves null values and creates sparse destination parents', () => {
        const output = spell<{ source: null; items?: Array<{ label?: null }> }>()
            .move('source', ['items', 2, 'label'])
            .build()
            .run({ source: null });

        expect('source' in output).toBe(false);
        expect(output.items).toHaveLength(3);
        expect(0 in output.items).toBe(false);
        expect(1 in output.items).toBe(false);
        expect(output.items[2]).toEqual({ label: null });
    });

    it('rolls back when either staged branch is unsafe and never invokes getters', () => {
        const destinationGetter = vi.fn(() => 'secret');
        const destination = Object.defineProperty({ visible: true }, 'computed', {
            enumerable: true,
            get: destinationGetter,
        });
        const input = { destination, source: { token: 'still-present' } };
        const result = spell<{
            destination: { visible: boolean };
            source: { token: string };
        }>()
            .move(['source', 'token'], ['destination', 'token'], { id: 'atomic-move' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['destination', 'computed'],
                step: { id: 'atomic-move', kind: 'move' },
            }],
            ok: false,
        });
        expect(destinationGetter).not.toHaveBeenCalled();
        expect(input.source.token).toBe('still-present');
        expect('token' in input.destination).toBe(false);

        const sourceGetter = vi.fn(() => 'secret');
        const source = Object.defineProperty({ token: 'still-present' }, 'computed', {
            enumerable: true,
            get: sourceGetter,
        });
        const lateInput = { destination: { visible: true }, source };
        const lateFailure = spell<{
            destination: { visible: boolean };
            source: { token: string };
        }>()
            .move(['source', 'token'], ['destination', 'token'], { id: 'late-move' })
            .build()
            .safeRun(lateInput);
        expect(lateFailure).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['source', 'computed'],
                step: { id: 'late-move', kind: 'move' },
            }],
            ok: false,
        });
        expect(sourceGetter).not.toHaveBeenCalled();
        expect(lateInput.source.token).toBe('still-present');
        expect('token' in lateInput.destination).toBe(false);

        const sourceLeafGetter = vi.fn(() => 'secret');
        const sourceLeaf = Object.defineProperty({}, 'token', {
            enumerable: true,
            get: sourceLeafGetter,
        });
        const sourceReadFailure = spell<{ source: { token: string } }>()
            .move(['source', 'token'], 'target')
            .build()
            .safeRun({ source: sourceLeaf as { token: string } });
        expect(sourceReadFailure).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['source', 'token'] }],
            ok: false,
        });
        expect(sourceLeafGetter).not.toHaveBeenCalled();

        const destinationLeafGetter = vi.fn(() => 'secret');
        const destinationLeaf = Object.defineProperty({}, 'token', {
            enumerable: true,
            get: destinationLeafGetter,
        });
        const destinationReadFailure = spell<{
            destination: { token: string };
            source: string;
        }>()
            .move('source', ['destination', 'token'])
            .build()
            .safeRun({ destination: destinationLeaf as { token: string }, source: 'value' });
        expect(destinationReadFailure).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['destination', 'token'] }],
            ok: false,
        });
        expect(destinationLeafGetter).not.toHaveBeenCalled();
    });

    it('preserves null prototypes and rejects aliased writes that would create cycles', () => {
        const profile = Object.create(null) as { legacy: string };
        profile.legacy = 'value';
        const moved = spell<{ profile: typeof profile; result?: { value: string } }>()
            .move(['profile', 'legacy'], ['result', 'value'])
            .build()
            .run({ profile });
        expect(Object.getPrototypeOf(moved.profile)).toBeNull();
        expect(moved).toEqual({ profile: {}, result: { value: 'value' } });

        interface Node {
            child?: Node;
        }
        const shared: Node = {};
        const cyclic = spell<{ destination: Node; source: Node }>()
            .move('source', ['destination', 'child'])
            .build()
            .safeRun({ destination: shared, source: shared });
        expect(cyclic).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', step: { kind: 'move' } }],
            ok: false,
        });
        expect(shared.child).toBeUndefined();
    });

    it('rejects overlapping and dangerous paths and fails closed in the static compiler', () => {
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile'], ['profile', 'legacy']),
            'invalid_path',
        );
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile', 'legacy'], ['profile']),
            'invalid_path',
        );
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile', 'legacy'], ['profile', 'legacy']),
            'invalid_path',
        );

        const dangerous = ['output', 'constructor'] as unknown as readonly ['output', 'value'];
        expectPlanError(
            () => spell<{ source: string }>().move('source', dangerous),
            'dangerous_key',
        );
        const compiled = spell<{ source: string }>().move('source', 'target').build();
        expect(() => emitTrustedMapperModule(compiled)).toThrow(CompilerError);
        expect(wand({ profile: { legacy: 'value' } })
            .move(['profile', 'legacy'], ['profile', 'current'])
            .value()).toEqual({ profile: { current: 'value' } });
    });
});
