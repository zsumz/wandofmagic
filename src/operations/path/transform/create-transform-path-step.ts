import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { Path } from '../../../core/path/path.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';
import { compileTransformPath } from './compile-transform-path.js';
import { createTransformPathPlan } from './create-transform-path-plan.js';

export function createTransformPathStep(
    path: Path,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const plan = createTransformPathPlan(path, transform, missing, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileTransformPath(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'transform' as const,
    });
}
