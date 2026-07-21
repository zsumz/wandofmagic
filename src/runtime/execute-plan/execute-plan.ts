import type { WandChange } from '../../core/change/receipt-types.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import type { WandResult } from '../../core/execution/result.js';
import { castOutput } from '../../internal/type-boundary/record.js';
import type { CompiledPlan } from '../compiled-spell/compile-plan.js';
import { appendProjectedOmitChanges } from '../project-record/append-projected-omit-changes.js';
import {
    executionFailure,
    exposeChanges,
    resolveExecutionOptions,
    takeExecutionSnapshot,
} from './execution-support.js';

export function executePlan<Output extends object>(
    input: object,
    plan: CompiledPlan,
    runOptions?: RunOptions,
): WandResult<Output> {
    const options = resolveExecutionOptions(runOptions);
    const changes: WandChange[] | undefined = options.receipt === 'collect' ? [] : undefined;
    const snapshot = takeExecutionSnapshot(input, plan, changes, options);
    if (!snapshot.ok) {
        return executionFailure(snapshot.issue, changes);
    }

    const issue = plan.executor?.(snapshot.value, changes);
    if (issue !== undefined) {
        return executionFailure(issue, changes);
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
