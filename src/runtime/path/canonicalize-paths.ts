import { PlanError } from '../../core/plan/plan-error.js';
import type {
    FieldPath,
    PathInput,
} from '../../core/path/path.js';
import { normalizePath } from './normalize-path.js';
import { isPathPrefix } from './path-prefix.js';

/** Normalize, deduplicate, and remove selections covered by an ancestor path. */
export function canonicalizePaths(
    pathInputs: readonly PathInput[],
    operation: string,
): readonly FieldPath[] {
    if (pathInputs.length === 0) {
        throw new PlanError('empty_operation', `${operation}() requires at least one path.`);
    }
    const unique: FieldPath[] = [];
    for (const input of pathInputs) {
        const path = normalizePath(input);
        if (!unique.some((candidate) => samePath(candidate, path))) {
            unique.push(path);
        }
    }
    return Object.freeze(unique.filter((candidate) => !unique.some((other) =>
        other !== candidate
        && other.length < candidate.length
        && isPathPrefix(other, candidate))));
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length && isPathPrefix(left, right);
}
