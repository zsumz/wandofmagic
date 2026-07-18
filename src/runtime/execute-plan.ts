import { freezeChanges, type WandChange } from '../core/change.js';
import { WandError } from '../core/errors.js';
import { createIssue, type WandIssue } from '../core/issue.js';
import type { RunOptions } from '../core/options.js';
import type { WandFailure, WandResult } from '../core/result.js';
import { castOutput } from '../internal/type-boundary.js';
import type { CompiledPlan } from './compile-plan.js';
import { snapshotRecord } from './data-record.js';
import { appendProjectedOmitChanges } from './project-record.js';
import {
    defaultRunOptions,
    resolveRunOptions,
    type ResolvedRunOptions,
} from './run-options.js';
import type { SnapshotResult } from './snapshot-result.js';

const emptyChanges: readonly WandChange[] = Object.freeze([]);

function exposeChanges(changes: WandChange[] | undefined): readonly WandChange[] {
    return changes === undefined ? emptyChanges : freezeChanges(changes);
}

function failure(issue: WandIssue, changes: WandChange[] | undefined): WandFailure {
    return Object.freeze({
        changes: exposeChanges(changes),
        issues: Object.freeze([issue]),
        ok: false,
    });
}

function resolveOptions(options: RunOptions | undefined): ResolvedRunOptions {
    return options === undefined ? defaultRunOptions() : resolveRunOptions(options);
}

function takeSnapshot(
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

export function executePlan<Output extends object>(
    input: object,
    plan: CompiledPlan,
    runOptions?: RunOptions,
): WandResult<Output> {
    const options = resolveOptions(runOptions);
    const changes: WandChange[] | undefined = options.receipt === 'collect' ? [] : undefined;
    const snapshot = takeSnapshot(input, plan, changes, options);
    if (!snapshot.ok) {
        return failure(snapshot.issue, changes);
    }

    const issue = plan.executor?.(snapshot.value, changes);
    if (issue !== undefined) {
        return failure(issue, changes);
    }

    if (plan.projection !== undefined) {
        appendProjectedOmitChanges(
            changes,
            plan.projection,
            snapshot.deferredOmitMask ?? 0,
        );
    }

    return Object.freeze({
        changes: exposeChanges(changes),
        ok: true,
        value: castOutput<Output>(snapshot.value),
    });
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The compiled spell selects the erased output type.
export function runPlan<Output extends object>(
    input: object,
    plan: CompiledPlan,
    runOptions?: RunOptions,
): Output {
    const options = resolveOptions(runOptions);
    const changes: WandChange[] | undefined = options.receipt === 'collect' ? [] : undefined;
    const snapshot = takeSnapshot(input, plan, changes, options);
    if (!snapshot.ok) {
        throw new WandError(failure(snapshot.issue, changes));
    }

    const issue = plan.executor?.(snapshot.value, changes);
    if (issue !== undefined) {
        throw new WandError(failure(issue, changes));
    }

    return castOutput<Output>(snapshot.value);
}
