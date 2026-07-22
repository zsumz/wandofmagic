import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function derivePathConflictIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'destination_conflict',
        message: 'Cannot derive the selected path; its destination already exists.',
        path,
        step: { id, kind: 'derive' },
    });
}

export function missingDerivePathDependencyIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot derive the selected path; a dependency is missing or undefined.',
        path,
        step: { id, kind: 'derive' },
    });
}

export function asyncDerivePathIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'transform_failed',
        message: 'The derive callback for the selected path returned a promise.',
        path,
        step: { id, kind: 'derive' },
    });
}

export function thrownDerivePathIssue(cause: unknown, path: FieldPath, id: string): WandIssue {
    return createIssue({
        cause,
        code: 'transform_failed',
        message: 'The derive callback for the selected path threw an error.',
        path,
        step: { id, kind: 'derive' },
    });
}
