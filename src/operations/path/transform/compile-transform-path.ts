import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import { readPath } from '../../../runtime/path/read-path.js';
import { runPathTransform } from './run-path-transform.js';
import { missingTransformPathIssue } from './transform-path-issues.js';
import type { TransformPathPlan } from './transform-path-plan.js';

export function compileTransformPath(
    plan: TransformPathPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    const { change, id, missing, path, transform } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        const read = readPath(value, path);
        if (read.status === 'failed') {
            return attachIssueStep(read.issue, { id, kind: 'transform' });
        }
        if (read.status === 'missing' || read.value === undefined) {
            return missing === 'skip'
                ? next?.(value, changes)
                : missingTransformPathIssue(path, id);
        }
        const transformed = runPathTransform(transform, read.value, path, id);
        if (!transformed.ok) {
            return transformed.issue;
        }
        if (Object.is(read.value, transformed.value)) {
            return next?.(value, changes);
        }
        const write = commitSetPathValue(value, path, transformed.value);
        if (!write.ok) {
            return attachIssueStep(write.issue, { id, kind: 'transform' });
        }
        changes?.push(change);
        return next?.(value, changes);
    };
}
