import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';
import { compileTransform } from './compile-transform.js';
import { createTransformPlan } from './create-transform-plan.js';

export function createTransformStep(
    key: string,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const plan = createTransformPlan(key, transform, missing, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileTransform(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'transform' as const,
    });
}
