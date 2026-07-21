import type { Coercer } from '../../../coerce/types.js';
import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import { createCoerceStep } from '../../../operations/flat/coerce/create-coerce-step.js';
import { createCoercePathStep } from '../../../operations/path/coerce/create-coerce-path-step.js';

export function createCoerceDispatchStep(
    path: PathInput,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    return typeof path === 'string'
        ? createCoerceStep(path, coercer, missing, id)
        : createCoercePathStep(path, coercer, missing, id);
}
