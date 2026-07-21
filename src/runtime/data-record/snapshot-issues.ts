import { createIssue } from '../../core/issue/create-issue.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import { fieldPath } from '../../core/path/path.js';

export function snapshotAccessorIssue(key: string): WandIssue {
    return createIssue({
        code: 'unsupported_accessor',
        message: `Wandofmagic will not execute the accessor at ${key}.`,
        path: fieldPath(key),
    });
}
