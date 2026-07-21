import type { WandChange } from '../../core/change/receipt-types.js';
import { WandError } from '../../core/execution/wand-error.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import { castOutput } from '../../internal/type-boundary/record.js';
import type { CompiledPlan } from '../compiled-spell/compile-plan.js';
import {
    executionFailure,
    resolveExecutionOptions,
    takeExecutionSnapshot,
} from './execution-support.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The compiled spell selects the erased output type.
export function runPlan<Output extends object>(
    input: object,
    plan: CompiledPlan,
    runOptions?: RunOptions,
): Output {
    const options = resolveExecutionOptions(runOptions);
    const changes: WandChange[] | undefined = options.receipt === 'collect' ? [] : undefined;
    const snapshot = takeExecutionSnapshot(input, plan, changes, options);
    if (!snapshot.ok) {
        throw new WandError(executionFailure(snapshot.issue, changes));
    }

    const issue = plan.executor?.(snapshot.value, changes);
    if (issue !== undefined) {
        throw new WandError(executionFailure(issue, changes));
    }

    return castOutput<Output>(snapshot.value);
}
