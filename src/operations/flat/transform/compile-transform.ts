import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import {
    invokeTransform,
    isPromiseLike,
} from '../../../internal/type-boundary/callback.js';
import { hasOwn } from '../../../runtime/data-record/record-fields.js';
import {
    asyncTransformIssue,
    missingTransformIssue,
    thrownTransformIssue,
} from './transform-issues.js';
import type { TransformPlan } from './transform-plan.js';

export function compileTransform(
    plan: TransformPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    const { change, id, key, missing, path, transform } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        let current: unknown;
        if (hasOwn(value, key)) {
            current = value[key];
        }
        if (current === undefined) {
            if (missing === 'skip') {
                return next?.(value, changes);
            }
            return missingTransformIssue(key, path, id);
        }

        let transformed: unknown;
        try {
            transformed = invokeTransform(transform, current);
            if (isPromiseLike(transformed)) {
                return asyncTransformIssue(key, path, id);
            }
        } catch (cause) {
            return thrownTransformIssue(cause, key, path, id);
        }

        if (Object.is(current, transformed)) {
            return next?.(value, changes);
        }
        value[key] = transformed;
        changes?.push(change);
        return next?.(value, changes);
    };
}
