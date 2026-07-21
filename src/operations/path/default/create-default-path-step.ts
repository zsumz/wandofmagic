import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { Path } from '../../../core/path/path.js';
import { compileDefaultPath } from './compile-default-path.js';
import { createDefaultPathPlan } from './create-default-path-plan.js';

export function createDefaultPathStep(
    path: Path,
    fallback: unknown,
    id: string,
): ExecutableStep {
    const plan = createDefaultPathPlan(path, fallback, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileDefaultPath(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'default' as const,
    });
}
