import { createIssue } from '../../core/issue/create-issue.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import { prefixCollectionPath } from './prefix-path.js';

export function prefixCollectionIssue(index: number, issue: WandIssue): WandIssue {
    return createIssue({
        ...issue.cause === undefined ? {} : { cause: issue.cause },
        code: issue.code,
        ...issue.details === undefined ? {} : { details: issue.details },
        message: issue.message,
        path: prefixCollectionPath(index, issue.path),
        ...issue.step === undefined ? {} : { step: issue.step },
    });
}
