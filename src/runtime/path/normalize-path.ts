import { PlanError } from '../../core/plan/plan-error.js';
import {
    pathDepthLimit,
    type FieldPath,
    type PathInput,
    type PathSegment,
} from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import { assertSafeKey } from './safe-key.js';

/** Copy, validate, and freeze a path before retaining it in an executable plan. */
export function normalizePath(input: PathInput): FieldPath {
    if (typeof input === 'string') {
        assertSafeKey(input);
        return Object.freeze([input]);
    }
    const candidate: unknown = input;
    if (
        !isUnknownArray(candidate)
        || candidate.length === 0
        || typeof candidate[0] !== 'string'
    ) {
        throw new PlanError(
            'invalid_path',
            'A deep path must be a non-empty tuple beginning with a string field.',
        );
    }
    if (candidate.length > pathDepthLimit) {
        throw new PlanError(
            'path_too_deep',
            `A path may contain at most ${String(pathDepthLimit)} segments.`,
        );
    }

    const normalized: PathSegment[] = [];
    for (const segment of candidate) {
        if (typeof segment === 'string') {
            assertSafeKey(segment);
            normalized.push(segment);
            continue;
        }
        if (typeof segment !== 'number' || !Number.isSafeInteger(segment) || segment < 0) {
            throw new PlanError(
                'invalid_path',
                'Numeric path segments must be non-negative safe integers.',
            );
        }
        normalized.push(Object.is(segment, -0) ? 0 : segment);
    }

    return freezePath(normalized);
}

function freezePath(segments: readonly PathSegment[]): FieldPath {
    const [first, ...rest] = segments;
    if (typeof first !== 'string') {
        throw new PlanError('invalid_path', 'A normalized path must begin with a string field.');
    }
    return Object.freeze([first, ...rest]);
}
