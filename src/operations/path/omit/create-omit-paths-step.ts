import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { compileOmitPaths } from './compile-omit-paths.js';
import { createOmitPathsPlan } from './create-omit-paths-plan.js';

export function createOmitPathsStep(
    paths: readonly PathInput[],
    id: string,
): ExecutableStep {
    const plan = createOmitPathsPlan(paths, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileOmitPaths(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'omit' as const,
    });
}
