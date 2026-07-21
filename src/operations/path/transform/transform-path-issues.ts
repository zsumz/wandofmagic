import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function missingTransformPathIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot transform the selected path; it is missing or undefined.',
        path,
        step: { id, kind: 'transform' },
    });
}

export function asyncTransformPathIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'transform_failed',
        message: 'The transform for the selected path returned a promise.',
        path,
        step: { id, kind: 'transform' },
    });
}

export function thrownTransformPathIssue(
    cause: unknown,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        cause,
        code: 'transform_failed',
        message: 'The transform for the selected path threw an error.',
        path,
        step: { id, kind: 'transform' },
    });
}
