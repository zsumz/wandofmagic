import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { createDefaultStep } from '../../../operations/flat/default/create-default-step.js';
import { createDefaultPathStep } from '../../../operations/path/default/create-default-path-step.js';

export function createDefaultDispatchStep(
    path: PathInput,
    fallback: unknown,
    id: string,
): ExecutableStep {
    return typeof path === 'string'
        ? createDefaultStep(path, fallback, id)
        : createDefaultPathStep(path, fallback, id);
}
