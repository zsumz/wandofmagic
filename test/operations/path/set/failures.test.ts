import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('deep set failures', () => {
    it('attaches the step without mutating input or invoking accessors', () => {
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
});
