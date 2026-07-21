import { describe, expect, it } from 'vitest';

import { deletePathValue } from '../../../src/runtime/path/delete-path-value.js';
import { setPathValue } from '../../../src/runtime/path/set-path-value.js';
import {
    createReferenceFixture,
    referenceMutationPaths,
} from './fixture-corpus.js';
import { referenceDelete, referenceSet } from './mutation.js';
import { snapshotReferenceValue } from './snapshot-value.js';

describe('deep path property reference conformance', () => {
    it('matches a deliberately simple reference implementation', () => {
        const paths = referenceMutationPaths();
        const values: readonly unknown[] = ['changed', 0, 42, false, null, undefined];
        const random = deterministicRandom(0x5eeda11);

        for (let run = 0; run < 256; run += 1) {
            const path = requiredItem(paths, random() % paths.length);
            const input = createReferenceFixture();
            const before = snapshotReferenceValue(input);

            if ((random() & 1) === 0) {
                const replacement = values[random() % values.length];
                const actual = setPathValue(input, path, replacement);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    continue;
                }
                const expected = referenceSet(input, path, replacement);
                expect(snapshotReferenceValue(actual.value))
                    .toEqual(snapshotReferenceValue(expected));
            } else {
                const actual = deletePathValue(input, path);
                expect(actual.ok).toBe(true);
                if (!actual.ok) {
                    continue;
                }
                const expected = referenceDelete(input, path);
                expect(snapshotReferenceValue(actual.value))
                    .toEqual(snapshotReferenceValue(expected));
            }

            expect(snapshotReferenceValue(input)).toEqual(before);
        }
    });
});

function requiredItem<Value>(values: readonly Value[], index: number): Value {
    const value = values[index];
    if (value === undefined) {
        throw new TypeError('The reference corpus selected an invalid item.');
    }
    return value;
}

function deterministicRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = Math.imul(state, 1_664_525) + 1_013_904_223 >>> 0;
        return state;
    };
}
