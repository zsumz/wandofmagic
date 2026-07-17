import type { WandChange } from './change.js';
import type { WandIssue } from './issue.js';
import type { WandFailure } from './result.js';

export type PlanErrorCode =
    | 'dangerous_key'
    | 'duplicate_dependency'
    | 'duplicate_destination'
    | 'duplicate_step_id'
    | 'empty_operation'
    | 'invalid_path'
    | 'invalid_step_id'
    | 'path_too_deep';

/** Thrown while constructing an invalid transformation plan. */
export class PlanError extends Error {
    public readonly code: PlanErrorCode;

    constructor(code: PlanErrorCode, message: string) {
        super(message);
        this.name = 'PlanError';
        this.code = code;
    }
}

/** Thrown by `run()` and `value()` when safe execution fails. */
export class WandError extends Error {
    public readonly changes: readonly WandChange[];
    public readonly issues: readonly WandIssue[];

    constructor(result: WandFailure) {
        super(result.issues[0]?.message ?? 'Wandofmagic could not transform the value.');
        this.name = 'WandError';
        this.changes = result.changes;
        this.issues = result.issues;
    }

    public toJSON(): Readonly<Record<string, unknown>> {
        return {
            changes: this.changes,
            issues: this.issues,
            message: this.message,
            name: this.name,
        };
    }
}
