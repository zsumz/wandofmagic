import type {
    ExecutableStep,
    PlanExecutor,
} from '../../core/plan/executable-step.js';
import { compileProjectionProgram } from '../projection-program/compile-projection-program.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';

export interface CompiledPlan {
    readonly executor: PlanExecutor | undefined;
    readonly projection: ProjectionProgram | undefined;
}

/** Compile immutable steps into one continuation chain and an optional structural projection. */
export function compilePlan(steps: readonly ExecutableStep[]): CompiledPlan {
    const projection = compileProjectionProgram(steps);
    const firstExecutorIndex = projection === undefined ? 0 : 1;
    const executorEnd = projection === undefined ? steps.length : steps.length - 1;
    let executor: PlanExecutor | undefined;

    for (let index = executorEnd - 1; index >= firstExecutorIndex; index -= 1) {
        const step = steps[index];
        if (step !== undefined) {
            executor = step.compile(executor);
        }
    }

    return Object.freeze({ executor, projection });
}
