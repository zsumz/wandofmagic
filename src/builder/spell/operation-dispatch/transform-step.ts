import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';
import { createTransformStep } from '../../../operations/flat/transform/create-transform-step.js';
import {
    createTransformPathStep,
} from '../../../operations/path/transform/create-transform-path-step.js';

export function createTransformDispatchStep(
    path: PathInput,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    return typeof path === 'string'
        ? createTransformStep(path, transform, missing, id)
        : createTransformPathStep(path, transform, missing, id);
}
