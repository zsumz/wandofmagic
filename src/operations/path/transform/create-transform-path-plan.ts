import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { Path } from '../../../core/path/path.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import type { TransformPathPlan } from './transform-path-plan.js';

export function createTransformPathPlan(
    pathInput: Path,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): TransformPathPlan {
    const path = normalizePath(pathInput);

    return Object.freeze({
        change: freezeChange({ kind: 'transform', path, stepId: id }),
        description: {
            id,
            kind: 'transform' as const,
            reads: [path],
            removes: [],
            writes: [path],
        },
        id,
        instruction: Object.freeze({
            binding: transform,
            id,
            kind: 'transform-path' as const,
            missing,
            path,
        }),
        missing,
        path,
        transform,
    });
}
