import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { compileSet } from './compile-set.js';
import { createSetPlan } from './create-set-plan.js';

export function createSetStep(
    path: PathInput,
    replacement: unknown,
    id: string,
): ExecutableStep {
    const plan = createSetPlan(path, replacement, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileSet(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'set' as const,
    });
}
