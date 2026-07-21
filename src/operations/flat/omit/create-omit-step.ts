import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import { compileOmit } from './compile-omit.js';
import { createOmitPlan } from './create-omit-plan.js';

export function createOmitStep(keys: readonly string[], id: string): ExecutableStep {
    const plan = createOmitPlan(keys, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileOmit(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'omit' as const,
        projection: plan.projection,
    });
}
