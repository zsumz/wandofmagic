import type { WandChange } from '../change/receipt-types.js';
import type { WandIssue } from '../issue/issue-types.js';
import type { WandFailure } from './result.js';

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
