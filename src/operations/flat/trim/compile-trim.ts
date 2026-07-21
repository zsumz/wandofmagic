import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { hasOwn } from '../../../runtime/data-record/record-fields.js';
import { invalidTrimValueIssue } from './trim-issues.js';
import type { TrimPlan } from './trim-plan.js';

export function compileTrim(plan: TrimPlan, next: PlanExecutor | undefined): PlanExecutor {
    const { fields, id } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        const currentValues: unknown[] = new Array(fields.length);
        for (let index = 0; index < fields.length; index += 1) {
            const field = fields[index];
            if (field === undefined || !hasOwn(value, field.key)) {
                continue;
            }

            const current = value[field.key];
            currentValues[index] = current;
            if (current === null || current === undefined) {
                continue;
            }
            if (typeof current !== 'string') {
                return invalidTrimValueIssue(field.key, field.path, id);
            }
        }

        for (let index = 0; index < fields.length; index += 1) {
            const field = fields[index];
            const current = currentValues[index];
            if (field !== undefined && typeof current === 'string') {
                const trimmed = current.trim();
                if (trimmed !== current) {
                    value[field.key] = trimmed;
                    changes?.push(field.change);
                }
            }
        }
        return next?.(value, changes);
    };
}
