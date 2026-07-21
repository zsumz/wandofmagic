import { describe, expect, it } from 'vitest';
import { number } from '../../src/coerce/index.js';
import { spell, WandError } from '../../src/index.js';

describe('execution diagnostic privacy', () => {
    it('keeps failed-result diagnostics free of input values in both receipt modes', () => {
        const secret = 'customer-secret-719';
        const invalidCount = 'invalid-count-313';
        const normalize = spell<{ count: string; secret: string }>()
            .rename({ secret: 'credential' })
            .coerce('count', number())
            .build();
        const input = { count: invalidCount, secret };

        for (const receipt of ['collect', 'discard'] as const) {
            const serialized = JSON.stringify(normalize.safeRun(input, { receipt }));
            expect(serialized).not.toContain(secret);
            expect(serialized).not.toContain(invalidCount);
        }

        try {
            normalize.run(input);
            throw new Error('Expected run() to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            expect(JSON.stringify(error)).not.toContain(secret);
            expect(JSON.stringify(error)).not.toContain(invalidCount);
        }
    });
});
