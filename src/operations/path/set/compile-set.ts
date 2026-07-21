import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import type { SetPlan } from './set-plan.js';

export function compileSet(plan: SetPlan, next: PlanExecutor | undefined): PlanExecutor {
    const { change, id, path, replacement } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        const result = commitSetPathValue(value, path, replacement);
        if (!result.ok) {
            return attachIssueStep(result.issue, { id, kind: 'set' });
        }
        if (result.changed) {
            changes?.push(change);
        }
        return next?.(value, changes);
    };
}
