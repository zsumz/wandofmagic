import type { DataRecord } from '../../../core/execution/data-record.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import {
    invokeDerive,
    isPromiseLike,
} from '../../../internal/type-boundary/callback.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import { readPath } from '../../../runtime/path/read-path.js';
import {
    asyncDerivePathIssue,
    derivePathConflictIssue,
    missingDerivePathDependencyIssue,
    thrownDerivePathIssue,
} from './derive-path-issues.js';
import type { DerivePathPlan } from './derive-path-plan.js';

export function compileDerivePath(
    plan: DerivePathPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    return (value, changes) => executeDerivePath(plan, next, value, changes);
}

function executeDerivePath(
    plan: DerivePathPlan,
    next: PlanExecutor | undefined,
    value: DataRecord,
    changes: ChangeCollector,
): StepOutcome {
    const destinationRead = readPath(value, plan.destination);
    if (destinationRead.status === 'failed') {
        return attachIssueStep(destinationRead.issue, { id: plan.id, kind: 'derive' });
    }
    if (destinationRead.status === 'found') {
        return derivePathConflictIssue(plan.destination, plan.id);
    }

    const inputs: unknown[] = [];
    for (const dependency of plan.dependencies) {
        const read = readPath(value, dependency);
        if (read.status === 'failed') {
            return attachIssueStep(read.issue, { id: plan.id, kind: 'derive' });
        }
        if (read.status === 'missing' || read.value === undefined) {
            return missingDerivePathDependencyIssue(dependency, plan.id);
        }
        inputs.push(read.value);
    }

    let derived: unknown;
    try {
        derived = invokeDerive(plan.derive, inputs);
        if (isPromiseLike(derived)) {
            return asyncDerivePathIssue(plan.destination, plan.id);
        }
    } catch (cause) {
        return thrownDerivePathIssue(cause, plan.destination, plan.id);
    }

    const written = commitSetPathValue(value, plan.destination, derived);
    if (!written.ok) {
        return attachIssueStep(written.issue, { id: plan.id, kind: 'derive' });
    }
    changes?.push(plan.change);
    return next?.(value, changes);
}
