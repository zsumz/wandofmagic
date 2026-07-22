import type { ExecutableStep, PlanExecutor } from '../../../core/plan/executable-step.js';
import type {
    Path,
    PathInput,
} from '../../../core/path/path.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';
import { compileDerivePath } from './compile-derive-path.js';
import { createDerivePathPlan } from './create-derive-path-plan.js';

export function createDerivePathStep(
    destination: Path,
    dependencies: readonly PathInput[],
    derive: ErasedDerive,
    id: string,
): ExecutableStep {
    const plan = createDerivePathPlan(destination, dependencies, derive, id);
    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileDerivePath(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'derive' as const,
    });
}
