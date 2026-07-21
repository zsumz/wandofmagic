import type { CreateIssueInput, WandIssue } from './issue-types.js';

export function createIssue(input: CreateIssueInput): WandIssue {
    const issue: WandIssue = {
        code: input.code,
        message: input.message,
        ...input.details === undefined ? {} : { details: Object.freeze({ ...input.details }) },
        ...input.path === undefined ? {} : { path: input.path },
        ...input.step === undefined ? {} : { step: Object.freeze({ ...input.step }) },
    };

    if (input.cause !== undefined) {
        Object.defineProperty(issue, 'cause', {
            configurable: false,
            enumerable: false,
            value: input.cause,
            writable: false,
        });
    }

    return Object.freeze(issue);
}
