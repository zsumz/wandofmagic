import { createIssue } from './create-issue.js';
import type { IssueStep, WandIssue } from './issue-types.js';

/** Preserve a runtime issue while attributing it to the operation that selected the path. */
export function attachIssueStep(issue: WandIssue, step: IssueStep): WandIssue {
    return createIssue({
        ...issue.cause === undefined ? {} : { cause: issue.cause },
        code: issue.code,
        ...issue.details === undefined ? {} : { details: issue.details },
        message: issue.message,
        ...issue.path === undefined ? {} : { path: issue.path },
        step,
    });
}
