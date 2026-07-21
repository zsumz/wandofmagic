import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import { readPath } from '../../../runtime/path/read-path.js';
import type { DefaultPathPlan } from './default-path-plan.js';

export function compileDefaultPath(
    plan: DefaultPathPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    const { change, fallback, id, path } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        const read = readPath(value, path);
        if (read.status === 'failed') {
            return attachIssueStep(read.issue, { id, kind: 'default' });
        }
        if (read.status !== 'missing' && read.value !== undefined) {
            return next?.(value, changes);
        }
        const write = commitSetPathValue(value, path, fallback);
        if (!write.ok) {
            return attachIssueStep(write.issue, { id, kind: 'default' });
        }
        changes?.push(change);
        return next?.(value, changes);
    };
}
