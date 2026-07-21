import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import { compileDefault } from './compile-default.js';
import { createDefaultPlan } from './create-default-plan.js';

export function createDefaultStep(key: string, fallback: unknown, id: string): ExecutableStep {
    const plan = createDefaultPlan(key, fallback, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileDefault(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'default' as const,
    });
}
