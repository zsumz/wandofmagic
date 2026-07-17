import type { FieldPath } from './path.js';
import type { StepKind } from './step-kind.js';

/** Stable issue codes form part of the public API. */
export type WandIssueCode =
    | 'coercion_failed'
    | 'destination_conflict'
    | 'invalid_input'
    | 'missing_field'
    | 'transform_failed'
    | 'unexpected_type'
    | 'unsupported_accessor';

interface IssueStep {
    readonly id: string;
    readonly kind: StepKind;
}

/** A structured execution failure. */
export interface WandIssue {
    readonly cause?: unknown;
    readonly code: WandIssueCode;
    readonly details?: Readonly<Record<string, unknown>>;
    readonly message: string;
    readonly path?: FieldPath;
    readonly step?: IssueStep;
}

export interface CreateIssueInput extends Omit<WandIssue, 'cause'> {
    readonly cause?: unknown;
}

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
