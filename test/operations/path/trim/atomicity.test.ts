import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep trim atomicity', () => {
    it('does not write earlier paths when a later value is invalid', () => {
        const input = { profile: { first: '  Ada  ', second: 42 as unknown as string } };
        const result = spell<{ profile: { first: string; second: string } }>()
            .trim([['profile', 'first'], ['profile', 'second']])
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unexpected_type',
                path: ['profile', 'second'],
                step: { kind: 'trim' },
            }],
            ok: false,
        });
        expect(input.profile.first).toBe('  Ada  ');
    });

    it('rejects accessors without executing them', () => {
        let reads = 0;
        const profile = { first: '  Ada  ' } as { first: string; second?: string };
        Object.defineProperty(profile, 'second', {
            enumerable: true,
            get() {
                reads += 1;
                return 'private';
            },
        });
        const result = spell<{ profile: typeof profile }>()
            .trim([['profile', 'first'], ['profile', 'second']])
            .build()
            .safeRun({ profile });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'second'] }],
            ok: false,
        });
        expect(reads).toBe(0);
    });
});
