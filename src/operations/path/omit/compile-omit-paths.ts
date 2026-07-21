import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitStagedPathRoots } from '../../../runtime/path/commit-staged-path-roots.js';
import { deletePathValue } from '../../../runtime/path/delete-path-value.js';
import type { OmitPathField, OmitPathsPlan } from './omit-paths-plan.js';

export function compileOmitPaths(
    plan: OmitPathsPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    const { fields, id } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        let staged = value;
        const changedFields: OmitPathField[] = [];
        for (const field of fields) {
            const deleted = deletePathValue(staged, field.path);
            if (!deleted.ok) {
                return attachIssueStep(deleted.issue, { id, kind: 'omit' });
            }
            if (deleted.changed) {
                staged = deleted.value;
                changedFields.push(field);
            }
        }
        if (changedFields.length === 0) {
            return next?.(value, changes);
        }

        commitStagedPathRoots(
            value,
            staged,
            changedFields.map((field) => field.path),
        );
        if (changes !== undefined) {
            for (const field of changedFields) {
                changes.push(field.change);
            }
        }
        return next?.(value, changes);
    };
}
