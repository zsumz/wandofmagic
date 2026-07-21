import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import { compileRename } from './compile-rename.js';
import { createRenamePlan } from './create-rename-plan.js';

export function createRenameStep(
    mapping: Readonly<Record<string, string>>,
    id: string,
): ExecutableStep {
    const plan = createRenamePlan(mapping, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileRename(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'rename' as const,
        projection: plan.projection,
    });
}
