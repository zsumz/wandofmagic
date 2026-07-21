import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import {
    invokeDerive,
    isPromiseLike,
} from '../../../internal/type-boundary/callback.js';
import { hasOwn } from '../../../runtime/data-record/record-fields.js';
import {
    asyncDeriveIssue,
    deriveConflictIssue,
    missingDeriveDependencyIssue,
    thrownDeriveIssue,
} from './derive-issues.js';
import type { DerivePlan } from './derive-plan.js';

export function compileDerive(plan: DerivePlan, next: PlanExecutor | undefined): PlanExecutor {
    const { change, dependencies, derive, id, key, path } = plan;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        if (hasOwn(value, key)) {
            return deriveConflictIssue(key, path, id);
        }

        const inputs: unknown[] = new Array(dependencies.length);
        for (let index = 0; index < dependencies.length; index += 1) {
            const field = dependencies[index];
            if (field === undefined) {
                continue;
            }
            let dependencyValue: unknown;
            if (hasOwn(value, field.dependency)) {
                dependencyValue = value[field.dependency];
            }
            if (dependencyValue === undefined) {
                return missingDeriveDependencyIssue(key, field.dependency, field.path, id);
            }
            inputs[index] = dependencyValue;
        }

        let derived: unknown;
        try {
            derived = invokeDerive(derive, inputs);
            if (isPromiseLike(derived)) {
                return asyncDeriveIssue(key, path, id);
            }
        } catch (cause) {
            return thrownDeriveIssue(cause, key, path, id);
        }

        value[key] = derived;
        changes?.push(change);
        return next?.(value, changes);
    };
}
