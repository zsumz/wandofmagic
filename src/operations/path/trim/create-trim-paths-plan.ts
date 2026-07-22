import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import type {
    FieldPath,
    PathInput,
} from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import { isPathPrefix } from '../../../runtime/path/path-prefix.js';
import type { TrimPathsPlan } from './trim-paths-plan.js';

export function createTrimPathsPlan(paths: readonly PathInput[], id: string): TrimPathsPlan {
    if (paths.length === 0) {
        throw new PlanError('empty_operation', 'trim() requires at least one path.');
    }
    const normalized: FieldPath[] = [];
    for (const pathInput of paths) {
        const path = normalizePath(pathInput);
        if (!normalized.some((candidate) => samePath(candidate, path))) {
            normalized.push(path);
        }
    }
    const fields = Object.freeze(normalized.map((path) => Object.freeze({
        change: freezeChange({ kind: 'trim', path, stepId: id }),
        path,
    })));
    const fieldPaths = Object.freeze(fields.map((field) => field.path));
    return Object.freeze({
        description: { id, kind: 'trim' as const, reads: fieldPaths, removes: [], writes: fieldPaths },
        fields,
        id,
        instruction: Object.freeze({ id, kind: 'trim-paths' as const, paths: fieldPaths }),
    });
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length && isPathPrefix(left, right);
}
