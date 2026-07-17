import type { WandChange } from './change.js';
import type { WandIssue } from './issue.js';

export interface WandSuccess<Output> {
    readonly changes: readonly WandChange[];
    readonly ok: true;
    readonly value: Output;
}

export interface WandFailure {
    readonly changes: readonly WandChange[];
    readonly issues: readonly WandIssue[];
    readonly ok: false;
}

/** Safe, discriminated execution result. */
export type WandResult<Output> = WandFailure | WandSuccess<Output>;
