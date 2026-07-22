import type { ExecutableStep, PlanExecutor } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { compileTrimPaths } from './compile-trim-paths.js';
import { createTrimPathsPlan } from './create-trim-paths-plan.js';

export function createTrimPathsStep(paths: readonly PathInput[], id: string): ExecutableStep {
    const plan = createTrimPathsPlan(paths, id);
    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileTrimPaths(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'trim' as const,
    });
}
