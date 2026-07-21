import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';
import { compileDerive } from './compile-derive.js';
import { createDerivePlan } from './create-derive-plan.js';

export function createDeriveStep(
    key: string,
    dependencies: readonly string[],
    derive: ErasedDerive,
    id: string,
): ExecutableStep {
    const plan = createDerivePlan(key, dependencies, derive, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileDerive(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'derive' as const,
    });
}
