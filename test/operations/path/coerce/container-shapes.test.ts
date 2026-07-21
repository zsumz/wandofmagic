import { describe, expect, it } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { spell } from '../../../../src/index.js';

describe('deep coerce container shapes', () => {
    it('supports null prototypes and sparse arrays without filling holes', () => {
        const profile = Object.create(null) as { counts: Array<{ value: string }> };
        const counts: Array<{ value: string }> = [];
        counts[3] = { value: '8' };
        profile.counts = counts;
        const output = spell<{ profile: typeof profile }>()
            .coerce(['profile', 'counts', 3, 'value'], number())
            .build()
            .run({ profile });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.counts).toHaveLength(4);
        expect(0 in output.profile.counts).toBe(false);
        expect(output.profile.counts[3]?.value).toBe(8);
    });
});
