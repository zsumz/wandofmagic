import type { Coercer } from '../../../coerce/types.js';
import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { Path } from '../../../core/path/path.js';
import { compileCoercePath } from './compile-coerce-path.js';
import { createCoercePathPlan } from './create-coerce-path-plan.js';

export function createCoercePathStep(
    path: Path,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const plan = createCoercePathPlan(path, coercer, missing, id);

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileCoercePath(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'coerce' as const,
    });
}
