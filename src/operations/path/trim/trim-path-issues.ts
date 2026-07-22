import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function invalidTrimPathValueIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'unexpected_type',
        message: 'Cannot trim the selected path; expected a string, null, or undefined.',
        path,
        step: { id, kind: 'trim' },
    });
}
