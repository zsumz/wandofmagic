import { createIssue } from '../../../core/issue/create-issue.js';
import type { FieldPath } from '../../../core/path/path.js';

export function createMissingCopyIssue(path: FieldPath, id: string): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot copy the selected path; its source is missing or undefined.',
        path,
        step: { id, kind: 'copy' },
    });
}

export function createCopyConflictIssue(
    path: FieldPath,
    id: string,
): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'destination_conflict',
        message: 'Cannot copy the selected path; its destination already exists.',
        path,
        step: { id, kind: 'copy' },
    });
}
