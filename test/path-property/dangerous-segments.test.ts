import { describe, it } from 'vitest';

import type { PathInput } from '../../src/core/path/path.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { expectPlanError } from '../support/expect-plan-error.js';

const dangerousSegments = ['__proto__', 'prototype', 'constructor'] as const;

describe('deep path property security', () => {
    it('rejects every dangerous segment at every supported depth', () => {
        for (const dangerous of dangerousSegments) {
            for (let index = 0; index < 8; index += 1) {
                const segments = Array.from(
                    { length: index + 1 },
                    (_, segmentIndex) => `field${String(segmentIndex)}`,
                );
                segments[index] = dangerous;

                expectPlanError(
                    () => normalizePath(segments as unknown as PathInput),
                    'dangerous_key',
                );
            }
        }
    });
});
