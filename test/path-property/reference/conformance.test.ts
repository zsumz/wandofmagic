import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { deletePathValue } from '../../../src/runtime/path/delete-path-value.js';
import { setPathValue } from '../../../src/runtime/path/set-path-value.js';
import { referenceMutation } from './arbitraries.js';
import { createReferenceFixture } from './fixture-corpus.js';
import { referenceDelete, referenceSet } from './mutation.js';
import { snapshotReferenceValue } from './snapshot-value.js';

describe('deep path property reference conformance', () => {
    it('matches a deliberately simple reference implementation', () => {
        fc.assert(fc.property(referenceMutation, (mutation) => {
            const input = createReferenceFixture();
            const before = snapshotReferenceValue(input);

            if (mutation.kind === 'set') {
                const actual = setPathValue(input, mutation.path, mutation.replacement);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    return;
                }
                const expected = referenceSet(input, mutation.path, mutation.replacement);
                expect(snapshotReferenceValue(actual.value))
                    .toEqual(snapshotReferenceValue(expected));
            } else {
                const actual = deletePathValue(input, mutation.path);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    return;
                }
                const expected = referenceDelete(input, mutation.path);
                expect(snapshotReferenceValue(actual.value))
                    .toEqual(snapshotReferenceValue(expected));
            }

            expect(snapshotReferenceValue(input)).toEqual(before);
        }), { numRuns: 1_000 });
    });
});
