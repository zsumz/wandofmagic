import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

interface Input {
    id: string;
    private: string;
    profile: { age: number; name: string; secret: string };
}

describe('path pick semantics', () => {
    it('projects flat fields in selector order', () => {
        const result = spell<Input>()
            .pick(['profile', 'id'], { id: 'public-shape' })
            .build()
            .safeRun({
                id: 'user-1',
                private: 'remove',
                profile: { age: 37, name: 'Ada', secret: 'remove' },
            });

        expect(result).toEqual({
            changes: [{
                kind: 'pick',
                paths: [['profile'], ['id']],
                stepId: 'public-shape',
            }],
            ok: true,
            value: {
                profile: { age: 37, name: 'Ada', secret: 'remove' },
                id: 'user-1',
            },
        });
    });

    it('merges deep selections and tolerates missing paths', () => {
        const value = spell<Input>()
            .pick([['profile', 'name'], ['profile', 'age'], 'id'])
            .build()
            .run({
                id: 'user-1',
                private: 'remove',
                profile: { age: 37, name: 'Ada', secret: 'remove' },
            });

        expect(value).toEqual({ id: 'user-1', profile: { age: 37, name: 'Ada' } });
        expect(wand<{ optional?: { value: string }; retained: boolean }>({ retained: true })
            .pick([['optional', 'value']])
            .value()).toEqual({});
    });

    it('removes descendant selections covered by an ancestor', () => {
        const normalize = spell<Input>()
            .pick([['profile', 'name'], 'profile', ['profile', 'age']])
            .build();

        expect(normalize.describe().steps[0]?.reads).toEqual([['profile']]);
        expect(normalize.run({
            id: 'remove',
            private: 'remove',
            profile: { age: 37, name: 'Ada', secret: 'kept' },
        })).toEqual({ profile: { age: 37, name: 'Ada', secret: 'kept' } });
    });

    it('does not report a change for an identical flat projection', () => {
        expect(spell<{ id: string; name: string }>()
            .pick(['id', 'name'])
            .build()
            .safeRun({ id: '1', name: 'Ada' })).toMatchObject({ changes: [], ok: true });
    });
});
