import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('move data-model preservation', () => {
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
});
