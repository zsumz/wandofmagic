import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep transform container shapes', () => {
    it('supports null prototypes and sparse arrays without filling holes', () => {
        const profile = Object.create(null) as { scores: Array<{ value: number }> };
        const scores: Array<{ value: number }> = [];
        scores[3] = { value: 4 };
        profile.scores = scores;

        const output = spell<{ profile: typeof profile }>()
            .transform(['profile', 'scores', 3, 'value'], (value) => value + 1)
            .build()
            .run({ profile });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.scores).toHaveLength(4);
        expect(0 in output.profile.scores).toBe(false);
        expect(output.profile.scores[3]?.value).toBe(5);
    });
});
