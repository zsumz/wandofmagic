import * as fc from 'fast-check';
import { describe, it } from 'vitest';

import type { PathInput } from '../../src/core/path/path.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { expectPlanError } from '../support/expect-plan-error.js';

const dangerousSegments = ['__proto__', 'prototype', 'constructor'] as const;
const safeKey = fc.stringMatching(/^[a-z][a-z0-9]{0,11}$/);

describe('deep path property security', () => {
    it('rejects dangerous segments amid generated safe path segments', () => {
        fc.assert(fc.property(
            fc.integer({ max: 8, min: 1 }),
            fc.integer({ max: 7, min: 0 }),
            fc.constantFrom(...dangerousSegments),
            fc.array(safeKey, { maxLength: 8, minLength: 8 }),
            (depth, candidateIndex, dangerous, safeSegments) => {
                const segments = safeSegments.slice(0, depth);
                segments[candidateIndex % depth] = dangerous;

                expectPlanError(
                    () => normalizePath(segments as unknown as PathInput),
                    'dangerous_key',
                );
            },
        ), { numRuns: 500 });
    });
});
