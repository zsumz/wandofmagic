import type { Coercer } from '../../../coerce/types.js';
import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import { compileCoerce } from './compile-coerce.js';
import { createCoercePlan } from './create-coerce-plan.js';

export function createCoerceStep(
    key: string,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const plan = createCoercePlan(key, coercer, missing, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileCoerce(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'coerce' as const,
    });
}
