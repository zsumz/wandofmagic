import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitStagedPathRoots } from '../../../runtime/path/commit-staged-path-roots.js';
import { deletePathValue } from '../../../runtime/path/delete-path-value.js';
import { readPath } from '../../../runtime/path/read-path.js';
import { setPathValue } from '../../../runtime/path/set-path-value.js';
import { createMissingMoveIssue, createMoveConflictIssue } from './move-issues.js';
import type { MovePlan } from './move-plan.js';

export function compileMove(plan: MovePlan, next: PlanExecutor | undefined): PlanExecutor {
    return (value, changes) => executeMove(plan, next, value, changes);
}

function executeMove(
    plan: MovePlan,
    next: PlanExecutor | undefined,
    value: DataRecord,
    changes: ChangeCollector,
): StepOutcome {
    const sourceRead = readPath(value, plan.source);
    if (sourceRead.status === 'failed') {
        return attachMoveIssue(sourceRead.issue, plan.id);
    }
    if (sourceRead.status === 'missing' || sourceRead.value === undefined) {
        return plan.missing === 'skip'
            ? next?.(value, changes)
            : createMissingMoveIssue(plan.source, plan.id);
    }

    const destinationRead = readPath(value, plan.destination);
    if (destinationRead.status === 'failed') {
        return attachMoveIssue(destinationRead.issue, plan.id);
    }
    if (destinationRead.status === 'found') {
        if (plan.conflict === 'preserve') {
            return next?.(value, changes);
        }
        if (plan.conflict === 'error') {
            return createMoveConflictIssue(plan.destination, plan.id);
        }
    }

    const written = setPathValue(value, plan.destination, sourceRead.value);
    if (!written.ok) {
        return attachMoveIssue(written.issue, plan.id);
    }
    const deleted = deletePathValue(written.value, plan.source);
    if (!deleted.ok) {
        return attachMoveIssue(deleted.issue, plan.id);
    }

    commitStagedPathRoots(value, deleted.value, [plan.source, plan.destination]);
    changes?.push(plan.change);
    return next?.(value, changes);
}

function attachMoveIssue(
    issue: Parameters<typeof attachIssueStep>[0],
    id: string,
): ReturnType<typeof attachIssueStep> {
    return attachIssueStep(issue, { id, kind: 'move' });
}
