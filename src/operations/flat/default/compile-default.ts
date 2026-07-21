import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { hasOwn } from '../../../runtime/data-record/record-fields.js';
import type { DefaultPlan } from './default-plan.js';

export function compileDefault(plan: DefaultPlan, next: PlanExecutor | undefined): PlanExecutor {
    const { change, fallback, key } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        if (hasOwn(value, key) && value[key] !== undefined) {
            return next?.(value, changes);
        }

        value[key] = fallback;
        changes?.push(change);
        return next?.(value, changes);
    };
}
