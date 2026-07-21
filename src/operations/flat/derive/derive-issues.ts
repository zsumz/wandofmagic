import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function deriveConflictIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'destination_conflict',
        message: `Cannot derive ${key}; the destination already exists.`,
        path,
        step: { id, kind: 'derive' },
    });
}

export function missingDeriveDependencyIssue(
    key: string,
    dependency: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: `Cannot derive ${key}; ${dependency} is missing or undefined.`,
        path,
        step: { id, kind: 'derive' },
    });
}

export function asyncDeriveIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'transform_failed',
        message: `The derive callback for ${key} returned a promise in the synchronous core.`,
        path,
        step: { id, kind: 'derive' },
    });
}

export function thrownDeriveIssue(
    cause: unknown,
    key: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        cause,
        code: 'transform_failed',
        message: `The derive callback for ${key} threw an error.`,
        path,
        step: { id, kind: 'derive' },
    });
}
