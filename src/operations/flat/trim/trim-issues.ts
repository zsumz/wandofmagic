import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function invalidTrimValueIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'unexpected_type',
        message: `Cannot trim ${key}; expected a string, null, or undefined.`,
        path,
        step: { id, kind: 'trim' },
    });
}
