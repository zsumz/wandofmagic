import { freezeChanges } from '../../core/change/freeze-receipt.js';
import type { WandChange } from '../../core/change/receipt-types.js';
import { createIssue } from '../../core/issue/create-issue.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import type { WandFailure } from '../../core/execution/result.js';
import type { CompiledPlan } from '../compiled-spell/compile-plan.js';
import { snapshotRecord } from '../data-record/snapshot-record.js';
import {
    defaultRunOptions,
    resolveRunOptions,
    type ResolvedRunOptions,
} from '../run-options/resolve-options.js';
import type { SnapshotResult } from '../data-record/snapshot-result.js';

const emptyChanges: readonly WandChange[] = Object.freeze([]);

export function exposeChanges(changes: WandChange[] | undefined): readonly WandChange[] {
    return changes === undefined ? emptyChanges : freezeChanges(changes);
}

export function executionFailure(
    issue: WandIssue,
    changes: WandChange[] | undefined,
): WandFailure {
    return Object.freeze({
        changes: exposeChanges(changes),
        issues: Object.freeze([issue]),
        ok: false,
    });
}

export function resolveExecutionOptions(
    options: RunOptions | undefined,
): ResolvedRunOptions {
    return options === undefined ? defaultRunOptions() : resolveRunOptions(options);
}

export function takeExecutionSnapshot(
    input: object,
    plan: CompiledPlan,
    changes: WandChange[] | undefined,
    options: ResolvedRunOptions,
): SnapshotResult {
    try {
        return snapshotRecord(input, plan.projection, changes, options.input);
    } catch (cause) {
        return {
            ok: false,
            issue: createIssue({
                cause,
                code: 'invalid_input',
                message: 'Wandofmagic could not inspect the input record.',
            }),
        };
    }
}
