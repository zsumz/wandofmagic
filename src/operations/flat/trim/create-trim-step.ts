import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import { compileTrim } from './compile-trim.js';
import { createTrimPlan } from './create-trim-plan.js';

export function createTrimStep(keys: readonly string[], id: string): ExecutableStep {
    const plan = createTrimPlan(keys, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileTrim(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'trim' as const,
    });
}
