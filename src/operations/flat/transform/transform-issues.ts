import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function missingTransformIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: `Cannot transform ${key}; the field is missing or undefined.`,
        path,
        step: { id, kind: 'transform' },
    });
}

export function asyncTransformIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'transform_failed',
        message: `The transform for ${key} returned a promise in the synchronous core.`,
        path,
        step: { id, kind: 'transform' },
    });
}

export function thrownTransformIssue(
    cause: unknown,
    key: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        cause,
        code: 'transform_failed',
        message: `The transform for ${key} threw an error.`,
        path,
        step: { id, kind: 'transform' },
    });
}
