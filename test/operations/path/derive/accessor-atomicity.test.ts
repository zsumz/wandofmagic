import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep derive accessor atomicity', () => {
    it('does not execute dependency accessors or invoke the callback', () => {
        let callbackCalls = 0;
        let reads = 0;
        const profile = { first: 'Ada' } as { first: string; last?: string };
        Object.defineProperty(profile, 'last', {
            enumerable: true,
            get() {
                reads += 1;
                return 'private';
            },
        });

        const result = spell<{ profile: typeof profile }>()
            .derive(
                ['profile', 'label'],
                [['profile', 'first'], ['profile', 'last']],
                () => {
                    callbackCalls += 1;
                    return 'value';
                },
            )
            .build()
            .safeRun({ profile });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'last'] }],
            ok: false,
        });
        expect(callbackCalls).toBe(0);
        expect(reads).toBe(0);
    });
});
