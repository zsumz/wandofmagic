import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('deep omit path canonicalization', () => {
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
});
