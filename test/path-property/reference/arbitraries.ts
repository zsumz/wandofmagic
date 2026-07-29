import * as fc from 'fast-check';

import type { FieldPath, PathInput, PathSegment } from '../../../src/core/path/path.js';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { referenceMutationPaths } from './fixture-corpus.js';

export interface ReferenceMutation {
    readonly kind: 'delete' | 'set';
    readonly path: FieldPath;
    readonly replacement: unknown;
}

const safeSegment = fc.oneof(
    fc.stringMatching(/^[a-z][a-z0-9]{0,11}$/),
    fc.integer({ max: 5, min: 0 }),
);

const generatedPath = fc
    .array(safeSegment, { maxLength: 7 })
    .map((tail) => normalizedPath(['generated', ...tail]));

const path = fc.oneof(
    fc.constantFrom(...referenceMutationPaths()),
    generatedPath,
);

export const referenceMutation = fc.record({
    kind: fc.constantFrom('delete', 'set'),
    path,
    replacement: fc.oneof(fc.jsonValue(), fc.constant(undefined)),
});

function normalizedPath(segments: readonly PathSegment[]): FieldPath {
    return normalizePath(segments as unknown as PathInput);
}
