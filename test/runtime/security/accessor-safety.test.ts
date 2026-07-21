import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('runtime accessor safety', () => {
    it('never executes enumerable getters', () => {
        let calls = 0;
        const input = Object.defineProperty({}, 'secret', {
            enumerable: true,
            get() {
                calls += 1;
                return 'do not read';
            },
        });

        const result = spell<Record<string, unknown>>().build().safeRun(input);

        expect(result).toMatchObject({
            issues: [{ code: 'unsupported_accessor', path: ['secret'] }],
            ok: false,
        });
        expect(calls).toBe(0);
    });
});
