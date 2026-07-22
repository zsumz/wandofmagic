import type { DataRecord } from '../../../core/execution/data-record.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import type { FieldPath } from '../../../core/path/path.js';
import { replaceRecordContents } from '../../../runtime/data-record/replace-record-contents.js';
import type { PickPlan } from './pick-plan.js';
import { projectPickedPaths } from './project-picked-paths.js';

export function compilePick(plan: PickPlan, next: PlanExecutor | undefined): PlanExecutor {
    return (value, changes) => executePick(plan, next, value, changes);
}

function executePick(
    plan: PickPlan,
    next: PlanExecutor | undefined,
    value: DataRecord,
    changes: ChangeCollector,
): StepOutcome {
    const projected = projectPickedPaths(value, plan.paths);
    if (!projected.ok) {
        return attachIssueStep(projected.issue, { id: plan.id, kind: 'pick' });
    }

    const changed = projectionChangesValue(value, plan.paths);
    replaceRecordContents(value, projected.value);
    if (changed) {
        changes?.push(plan.change);
    }
    return next?.(value, changes);
}

function projectionChangesValue(value: DataRecord, paths: readonly FieldPath[]): boolean {
    const keys = Object.keys(value);
    return paths.some((path) => path.length > 1)
        || keys.length !== paths.length
        || keys.some((key, index) => paths[index]?.[0] !== key);
}
