import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

describe('deep copy semantics', () => {
    it('copies a value without removing its source', () => {
        const normalize = spell<{ profile: { legacy: string }; retained: boolean }>()
            .copy(['profile', 'legacy'], ['profile', 'current'])
            .build();
        const input = { profile: { legacy: 'kept' }, retained: true };

        expect(normalize.safeRun(input)).toEqual({
            changes: [{
                from: ['profile', 'legacy'],
                kind: 'copy',
                stepId: 'copy:1',
                to: ['profile', 'current'],
            }],
            ok: true,
            value: {
                profile: { current: 'kept', legacy: 'kept' },
                retained: true,
            },
        });
        expect(input).toEqual({ profile: { legacy: 'kept' }, retained: true });
    });

    it('supports one-off wands and destination ancestors', () => {
        expect(wand({ profile: { name: 'Ada' }, stable: true })
            .copy(['profile', 'name'], 'profile', { conflict: 'overwrite' })
            .value()).toEqual({ profile: 'Ada', stable: true });
    });

    it('describes its reads and writes without a removal', () => {
        expect(spell<{ source: string }>()
            .copy('source', ['nested', 'target'], { id: 'retain-source' })
            .build()
            .describe().steps).toEqual([{
            id: 'retain-source',
            kind: 'copy',
            reads: [['source'], ['nested', 'target']],
            removes: [],
            writes: [['nested', 'target']],
        }]);
    });
});
