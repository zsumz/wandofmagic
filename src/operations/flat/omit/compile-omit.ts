import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import {
    deleteField,
    hasOwn,
} from '../../../runtime/data-record/record-fields.js';
import type { OmitPlan } from './omit-plan.js';

export function compileOmit(plan: OmitPlan, next: PlanExecutor | undefined): PlanExecutor {
    const { fields } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        for (const field of fields) {
            if (hasOwn(value, field.key)) {
                deleteField(value, field.key);
                changes?.push(field.change);
            }
        }
        return next?.(value, changes);
    };
}
