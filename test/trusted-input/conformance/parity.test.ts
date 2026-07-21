import { describe, expect, it } from 'vitest';

import { createConformanceInput } from './create-conformance-input.js';
import { normalizeConformanceInput } from './normalize-conformance-input.js';

describe('trusted execution conformance', () => {
    it('matches checked behavior for valid trusted-record shapes', () => {
        for (let index = 0; index < 64; index += 1) {
            const input = createConformanceInput(index);
            for (const receipt of ['collect', 'discard'] as const) {
                const checked = normalizeConformanceInput.safeRun(
                    input,
                    { input: 'checked', receipt },
                );
                const trusted = normalizeConformanceInput.safeRun(
                    input,
                    { input: 'trusted', receipt },
                );
                expect(trusted).toEqual(checked);
                if (checked.ok && trusted.ok) {
                    expect(Object.getPrototypeOf(trusted.value)).toBe(
                        Object.getPrototypeOf(checked.value),
                    );
                    expect(Object.keys(trusted.value)).toEqual(Object.keys(checked.value));
                }
            }
        }
    });
});
