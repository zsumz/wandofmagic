import { createIssue } from '../../../core/issue/create-issue.js';
import type { FieldPath } from '../../../core/path/path.js';

export function createMissingMoveIssue(path: FieldPath, id: string): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot move the selected path; its source is missing or undefined.',
        path,
        step: { id, kind: 'move' },
    });
}

export function createMoveConflictIssue(
    path: FieldPath,
    id: string,
): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'destination_conflict',
        message: 'Cannot move the selected path; its destination already exists.',
        path,
        step: { id, kind: 'move' },
    });
}
