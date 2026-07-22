import type { DataRecord } from '../../../core/execution/data-record.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import { readPath } from '../../../runtime/path/read-path.js';
import { createCopyConflictIssue, createMissingCopyIssue } from './copy-issues.js';
import type { CopyPlan } from './copy-plan.js';

export function compileCopy(plan: CopyPlan, next: PlanExecutor | undefined): PlanExecutor {
    return (value, changes) => executeCopy(plan, next, value, changes);
}

function executeCopy(
    plan: CopyPlan,
    next: PlanExecutor | undefined,
    value: DataRecord,
    changes: ChangeCollector,
): StepOutcome {
    const sourceRead = readPath(value, plan.source);
    if (sourceRead.status === 'failed') {
        return attachCopyIssue(sourceRead.issue, plan.id);
    }
    if (sourceRead.status === 'missing' || sourceRead.value === undefined) {
        return plan.missing === 'skip'
            ? next?.(value, changes)
            : createMissingCopyIssue(plan.source, plan.id);
    }

    const destinationRead = readPath(value, plan.destination);
    if (destinationRead.status === 'failed') {
        return attachCopyIssue(destinationRead.issue, plan.id);
    }
    if (destinationRead.status === 'found') {
        if (plan.conflict === 'preserve') {
            return next?.(value, changes);
        }
        if (plan.conflict === 'error') {
            return createCopyConflictIssue(plan.destination, plan.id);
        }
    }

    const written = commitSetPathValue(value, plan.destination, sourceRead.value);
    if (!written.ok) {
        return attachCopyIssue(written.issue, plan.id);
    }
    if (written.changed) {
        changes?.push(plan.change);
    }
    return next?.(value, changes);
}

function attachCopyIssue(
    issue: Parameters<typeof attachIssueStep>[0],
    id: string,
): ReturnType<typeof attachIssueStep> {
    return attachIssueStep(issue, { id, kind: 'copy' });
}
