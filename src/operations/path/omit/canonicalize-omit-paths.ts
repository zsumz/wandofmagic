import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import type {
    FieldPath,
    PathInput,
} from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import { isPathPrefix } from '../../../runtime/path/path-prefix.js';
import type { OmitPathField } from './omit-paths-plan.js';

export function canonicalizeOmitPaths(
    pathInputs: readonly PathInput[],
    id: string,
): readonly OmitPathField[] {
    if (pathInputs.length === 0) {
        throw new PlanError('empty_operation', 'omit() requires at least one path.');
    }
    const unique: FieldPath[] = [];
    for (const input of pathInputs) {
        const path = normalizePath(input);
        if (!unique.some((candidate) => samePath(candidate, path))) {
            unique.push(path);
        }
    }
    const retained = unique.filter((candidate) => !unique.some((other) =>
        other !== candidate
        && other.length < candidate.length
        && isPathPrefix(other, candidate)));

    return Object.freeze(retained.map((path) => Object.freeze({
        change: freezeChange({ kind: 'omit', path, stepId: id }),
        path,
    })));
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length && isPathPrefix(left, right);
}
